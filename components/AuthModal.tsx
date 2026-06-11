"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  MessageSquareText,
  Phone,
  ShieldCheck,
  X,
} from "lucide-react";
import { useAuthModal } from "@/lib/authModal";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";

/**
 * Phone-first authentication modal.
 *
 * Flow (as specified):
 *   1) phone        → enter mobile number, we check if it exists
 *   2a) password    → existing user types password ("send code instead" available)
 *   2b) register    → new user: choose name + optional password, then verify OTP
 *   2c) otp         → verify the 6-digit code (login or registration)
 *
 * All requests go through the server APIs; sign-in uses Auth.js credentials.
 */

type Step = "phone" | "password" | "otp" | "register";

const OTP_COOLDOWN = 60;

export default function AuthModal() {
  const { isOpen, redirectTo, close } = useAuthModal();
  const router = useRouter();
  useBodyScrollLock(isOpen);

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  // Tracks whether the OTP we sent was for a new (register) or existing (login) user.
  const [otpPurpose, setOtpPurpose] = useState<"LOGIN" | "REGISTER">("LOGIN");

  const firstFieldRef = useRef<HTMLInputElement>(null);

  // Reset to a clean state each time the modal opens.
  useEffect(() => {
    if (isOpen) {
      setStep("phone");
      setPhone("");
      setPassword("");
      setName("");
      setCode("");
      setError(null);
      setCooldown(0);
      setOtpPurpose("LOGIN");
    }
  }, [isOpen]);

  // Cooldown timer for OTP resend.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  // Esc to close.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  function finish() {
    close();
    if (redirectTo) router.push(redirectTo);
    else router.refresh();
  }

  async function api(path: string, body: unknown) {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return { res, data } as { res: Response; data: Record<string, unknown> };
  }

  // ── Step 1: check phone ──
  async function submitPhone(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { res, data } = await api("/api/auth/check-phone", { phone });
      if (res.status === 422) {
        setError("شماره موبایل نامعتبر است.");
        return;
      }
      if (!res.ok) {
        // Server / database problem — don't blame the phone number.
        setError(
          "ارتباط با سرور برقرار نشد. لطفاً از اتصال پایگاه‌داده مطمئن شوید و دوباره تلاش کنید.",
        );
        return;
      }
      if (data.exists && data.hasPassword) {
        setStep("password");
      } else if (data.exists) {
        // Exists but no password → OTP login.
        await sendOtp("LOGIN");
      } else {
        // New user → registration.
        setStep("register");
      }
    } catch {
      setError("خطا در ارتباط با سرور.");
    } finally {
      setLoading(false);
    }
  }

  // ── Send OTP ──
  async function sendOtp(purpose: "LOGIN" | "REGISTER") {
    setError(null);
    setLoading(true);
    try {
      const { res, data } = await api("/api/auth/otp", { phone, purpose });
      if (res.status === 429) {
        const ms = Number(data.retryAfterMs ?? OTP_COOLDOWN * 1000);
        setCooldown(Math.ceil(ms / 1000));
        setOtpPurpose(purpose);
        setStep("otp");
        return;
      }
      if (!res.ok) {
        setError("ارسال کد با خطا مواجه شد.");
        return;
      }
      setOtpPurpose(purpose);
      setCooldown(OTP_COOLDOWN);
      setStep("otp");
    } catch {
      setError("خطا در ارسال کد.");
    } finally {
      setLoading(false);
    }
  }

  // ── Password login ──
  async function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const r = await signIn("credentials", {
        phone,
        password,
        mode: "password",
        redirect: false,
      });
      if (r?.error) {
        setError("رمز عبور اشتباه است.");
        return;
      }
      finish();
    } catch {
      setError("خطا در ورود.");
    } finally {
      setLoading(false);
    }
  }

  // ── Register (new user) → send OTP ──
  async function submitRegister(e: React.FormEvent) {
    e.preventDefault();
    await sendOtp("REGISTER");
  }

  // ── Verify OTP (login or finish registration) ──
  async function submitOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (otpPurpose === "REGISTER") {
        const { res, data } = await api("/api/auth/register", {
          phone,
          code,
          name: name || undefined,
          password: password || undefined,
        });
        if (!res.ok) {
          setError(
            data.error === "ALREADY_EXISTS"
              ? "این شماره قبلاً ثبت شده است."
              : "کد تأیید نادرست است.",
          );
          return;
        }
      }
      // Sign in via OTP credentials (works for both flows; code is single-use,
      // so for REGISTER we just issued+consumed it server-side — re-issue a
      // login code transparently is avoided by signing in with password if set).
      const r = await signIn("credentials", {
        phone,
        code,
        mode: "otp",
        redirect: false,
      });
      if (r?.error) {
        // If the register flow already consumed the code, fall back to password.
        if (otpPurpose === "REGISTER" && password) {
          const r2 = await signIn("credentials", {
            phone,
            password,
            mode: "password",
            redirect: false,
          });
          if (!r2?.error) return finish();
        }
        setError("کد تأیید نامعتبر یا منقضی شده است.");
        return;
      }
      finish();
    } catch {
      setError("خطا در تأیید کد.");
    } finally {
      setLoading(false);
    }
  }

  const titles: Record<Step, string> = {
    phone: "ورود / ثبت‌نام",
    password: "رمز عبور",
    otp: "کد تأیید",
    register: "تکمیل ثبت‌نام",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="ورود به حساب"
          initial="closed"
          animate="open"
          exit="closed">
          <motion.div
            onClick={close}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            style={{ touchAction: "none" }}
            variants={{ open: { opacity: 1 }, closed: { opacity: 0 } }}
          />
          <motion.div
            className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 sm:p-8"
            variants={{
              open: { y: 0, opacity: 1 },
              closed: { y: 40, opacity: 0 },
            }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-glow">
                  <ShieldCheck size={20} />
                </span>
                <h2 className="font-display font-extrabold text-xl tracking-tight">
                  {titles[step]}
                </h2>
              </div>
              <button
                onClick={close}
                aria-label="بستن"
                className="text-ink-400 hover:text-ink-700 p-1">
                <X size={22} />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5">
                {error}
              </div>
            )}

            {/* STEP: phone */}
            {step === "phone" && (
              <form onSubmit={submitPhone} className="space-y-4">
                <p className="text-sm text-ink-500 leading-6">
                  شماره موبایل خود را وارد کنید تا وارد شوید یا حساب جدید
                  بسازید.
                </p>
                <Input
                  ref={firstFieldRef}
                  icon={<Phone size={18} />}
                  inputMode="numeric"
                  dir="ltr"
                  autoFocus
                  placeholder="09xxxxxxxxx"
                  value={phone}
                  onChange={setPhone}
                  className="tabular"
                />
                <SubmitButton loading={loading}>
                  ادامه <ArrowRight size={18} />
                </SubmitButton>
              </form>
            )}

            {/* STEP: password */}
            {step === "password" && (
              <form onSubmit={submitPassword} className="space-y-4">
                <PhoneBadge phone={phone} onEdit={() => setStep("phone")} />
                <div className="relative">
                  <Input
                    icon={<Lock size={18} />}
                    type={showPw ? "text" : "password"}
                    autoFocus
                    placeholder="رمز عبور"
                    value={password}
                    onChange={setPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                    aria-label={showPw ? "پنهان" : "نمایش"}>
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <SubmitButton loading={loading}>ورود</SubmitButton>
                <button
                  type="button"
                  onClick={() => sendOtp("LOGIN")}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 text-sm text-brand-600 font-semibold hover:text-brand-700 py-2">
                  <MessageSquareText size={16} />
                  ورود با کد پیامکی به‌جای رمز
                </button>
              </form>
            )}

            {/* STEP: register */}
            {step === "register" && (
              <form onSubmit={submitRegister} className="space-y-4">
                <PhoneBadge phone={phone} onEdit={() => setStep("phone")} />
                <p className="text-sm text-ink-500 leading-6">
                  حساب جدید! نام خود را وارد کنید. می‌توانید رمز عبور هم تعیین
                  کنید (اختیاری).
                </p>
                <Input
                  icon={<KeyRound size={18} />}
                  autoFocus
                  placeholder="نام و نام خانوادگی"
                  value={name}
                  onChange={setName}
                />
                <div className="relative">
                  <Input
                    icon={<Lock size={18} />}
                    type={showPw ? "text" : "password"}
                    placeholder="رمز عبور (اختیاری)"
                    value={password}
                    onChange={setPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                    aria-label={showPw ? "پنهان" : "نمایش"}>
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <SubmitButton loading={loading}>
                  دریافت کد تأیید <MessageSquareText size={16} />
                </SubmitButton>
              </form>
            )}

            {/* STEP: otp */}
            {step === "otp" && (
              <form onSubmit={submitOtp} className="space-y-4">
                <PhoneBadge phone={phone} onEdit={() => setStep("phone")} />
                <p className="text-sm text-ink-500 leading-6">
                  کد ۶ رقمی ارسال‌شده به شماره بالا را وارد کنید.
                </p>
                <Input
                  icon={<KeyRound size={18} />}
                  inputMode="numeric"
                  dir="ltr"
                  autoFocus
                  maxLength={6}
                  placeholder="------"
                  value={code}
                  onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
                  className="tabular tracking-[0.4em] text-center text-lg"
                />
                <SubmitButton loading={loading}>تأیید و ورود</SubmitButton>
                <button
                  type="button"
                  disabled={cooldown > 0 || loading}
                  onClick={() => sendOtp(otpPurpose)}
                  className="w-full text-sm text-ink-500 hover:text-brand-600 disabled:opacity-50 py-2">
                  {cooldown > 0
                    ? `ارسال مجدد کد تا ${cooldown} ثانیه دیگر`
                    : "ارسال مجدد کد"}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ───────── small presentational helpers ───────── */

import { forwardRef } from "react";

const Input = forwardRef<
  HTMLInputElement,
  {
    icon?: React.ReactNode;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    placeholder?: string;
    className?: string;
    autoFocus?: boolean;
    inputMode?: "text" | "numeric";
    dir?: "ltr" | "rtl";
    maxLength?: number;
  }
>(function Input(
  {
    icon,
    value,
    onChange,
    type = "text",
    placeholder,
    className = "",
    autoFocus,
    inputMode,
    dir,
    maxLength,
  },
  ref,
) {
  return (
    <div className="relative">
      {icon && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400">
          {icon}
        </span>
      )}
      <input
        ref={ref}
        type={type}
        value={value}
        autoFocus={autoFocus}
        inputMode={inputMode}
        dir={dir}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-2xl border border-ink-100 bg-ink-50/40 focus:bg-white px-10 py-3 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition ${className}`}
      />
    </div>
  );
});

function SubmitButton({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <button type="submit" disabled={loading} className="btn-primary w-full">
      {loading ? <Loader2 size={18} className="animate-spin" /> : children}
    </button>
  );
}

function PhoneBadge({ phone, onEdit }: { phone: string; onEdit: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-ink-50 px-4 py-2.5 text-sm">
      <span className="tabular text-ink-700" dir="ltr">
        {phone}
      </span>
      <button
        type="button"
        onClick={onEdit}
        className="text-brand-600 font-semibold hover:text-brand-700">
        ویرایش
      </button>
    </div>
  );
}
