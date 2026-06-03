"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, User, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuth((s) => s.login);
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const ok = login(u.trim(), p);
    if (!ok) {
      setLoading(false);
      setErr("نام کاربری یا رمز عبور اشتباه است.");
      return;
    }
    router.replace("/admin");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-bl from-brand-50 via-white to-brand-100/40">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-ink-100 p-8 md:p-10">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-glow">
            <ShieldCheck size={22} />
          </span>
          <div>
            <h1 className="font-display font-black text-2xl tracking-tight">
              ورود مدیر
            </h1>
            <p className="text-xs text-ink-500 mt-1">
              این صفحه فقط برای ادمین چاپ است.
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-ink-700">
              نام کاربری
            </span>
            <div className="mt-1.5 relative">
              <User
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"
              />
              <input
                required
                autoFocus
                autoComplete="username"
                value={u}
                onChange={(e) => setU(e.target.value)}
                className="w-full rounded-2xl border border-ink-100 bg-ink-50/40 focus:bg-white px-10 py-3 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition"
                placeholder="مثلاً SSP"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-ink-700">رمز عبور</span>
            <div className="mt-1.5 relative">
              <Lock
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"
              />
              <input
                required
                autoComplete="current-password"
                type={show ? "text" : "password"}
                value={p}
                onChange={(e) => setP(e.target.value)}
                className="w-full rounded-2xl border border-ink-100 bg-ink-50/40 focus:bg-white px-10 py-3 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition tabular"
                placeholder="••••"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                aria-label={show ? "پنهان کردن" : "نمایش"}>
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {err && (
            <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full">
            {loading ? "در حال ورود..." : "ورود به پنل مدیریتی"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-ink-500 hover:text-brand-600">
            بازگشت به سایت
          </Link>
        </div>
      </div>
    </div>
  );
}
