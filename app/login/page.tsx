"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, LogIn } from "lucide-react";
import { useAuthModal } from "@/lib/authModal";
import { useCurrentUser } from "@/lib/auth/client";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const open = useAuthModal((s) => s.open);
  const { isAuthed, isLoading } = useCurrentUser();

  // Already signed in → go where they were heading.
  useEffect(() => {
    if (!isLoading && isAuthed) router.replace(next);
  }, [isLoading, isAuthed, next, router]);

  // Auto-open the modal on arrival.
  useEffect(() => {
    if (!isLoading && !isAuthed) open(next);
  }, [isLoading, isAuthed, next, open]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-bl from-brand-50 via-white to-brand-100/40">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-ink-100 p-8 md:p-10 text-center">
        <span className="w-14 h-14 rounded-2xl bg-brand-500 text-white mx-auto flex items-center justify-center shadow-glow">
          <ShieldCheck size={26} />
        </span>
        <h1 className="font-display font-black text-2xl tracking-tight mt-5">
          ورود به حساب چامپ
        </h1>
        <p className="text-sm text-ink-500 mt-2 leading-7">
          برای ثبت سفارش، ذخیره ساندویچ‌ها و مشاهده تاریخچه، وارد حساب خود شوید.
        </p>
        <button onClick={() => open(next)} className="btn-primary w-full mt-6">
          <LogIn size={18} /> ورود / ثبت‌نام با موبایل
        </button>
        <div className="mt-6">
          <Link href="/" className="text-xs text-ink-500 hover:text-brand-600">
            بازگشت به سایت
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
