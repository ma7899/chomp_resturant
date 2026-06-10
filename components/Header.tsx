"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, User, X } from "lucide-react";
import Logo from "./Logo";
import { useCart, cartCount } from "@/lib/cart";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { useCurrentUser } from "@/lib/auth/client";
import { useAuthModal } from "@/lib/authModal";
import clsx from "clsx";

const NAV = [
  { href: "/", label: "خانه" },
  { href: "/menu", label: "منو" },
  { href: "/build", label: "ساندویچ خودت رو بساز" },
  { href: "/taste", label: "ذائقه‌سنج" },
  { href: "/about", label: "درباره ما" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const items = useCart((s) => s.items);
  const openCart = useCart((s) => s.open);
  const count = cartCount(items);
  const { isAuthed } = useCurrentUser();
  const openAuth = useAuthModal((s) => s.open);

  // Lock the page behind the mobile drawer so the user can't scroll the
  // background through the menu (fixes the "menu floating over scrolling
  // page" bug on iOS Safari and Android Chrome).
  useBodyScrollLock(open);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close drawer on Escape for keyboard users.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={clsx(
        "sticky top-0 z-40 transition-all",
        scrolled ? "bg-white/85 backdrop-blur-md shadow-sm" : "bg-transparent",
      )}>
      <div className="container-x flex items-center justify-between h-16 md:h-20">
        <Link href="/" className="flex items-center gap-2" aria-label="چامپ">
          <Logo className="h-9 md:h-10 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="px-4 py-2 rounded-full text-ink-800 hover:text-brand-600 hover:bg-brand-50 transition-colors font-medium tracking-tight">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={openCart}
            className="relative btn-ghost !px-3 !py-2"
            aria-label="سبد خرید">
            <ShoppingBag size={20} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 tabular">
                {count}
              </span>
            )}
          </button>
          {isAuthed ? (
            <Link
              href="/dashboard"
              className="btn-ghost !px-3 !py-2"
              aria-label="حساب کاربری">
              <User size={20} />
            </Link>
          ) : (
            <button
              onClick={() => openAuth("/dashboard")}
              className="btn-ghost !px-3 !py-2"
              aria-label="ورود">
              <User size={20} />
            </button>
          )}
          <Link
            href="/build"
            className="hidden sm:inline-flex btn-primary !py-2 !px-4 text-sm">
            سفارش آنلاین
          </Link>
          <button
            onClick={() => setOpen(true)}
            className="md:hidden btn-ghost !px-3 !py-2"
            aria-label="منو"
            aria-expanded={open}
            aria-controls="mobile-drawer">
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Mobile drawer — fixed to viewport, above everything (z-[60]).
          Body scroll is locked while open via useBodyScrollLock. */}
      <div
        id="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="منوی اصلی"
        className={clsx(
          "fixed inset-0 z-[60] md:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}>
        {/* Overlay */}
        <div
          onClick={() => setOpen(false)}
          className={clsx(
            "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0",
          )}
          style={{ touchAction: "none" }}
        />
        {/* Panel */}
        <aside
          className={clsx(
            "absolute top-0 right-0 h-[100dvh] w-[88%] max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out will-change-transform",
            open ? "translate-x-0" : "translate-x-full",
          )}>
          <div className="flex items-center justify-between p-5 border-b border-ink-100">
            <Logo className="h-9 w-auto" />
            <button
              onClick={() => setOpen(false)}
              className="btn-ghost !px-2 !py-2"
              aria-label="بستن">
              <X size={22} />
            </button>
          </div>
          <nav className="flex-1 flex flex-col gap-1 p-5 drawer-scroll overflow-y-auto">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-xl text-lg font-semibold text-ink-900 hover:bg-brand-50 hover:text-brand-700 tracking-tight">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="p-5 border-t border-ink-100">
            <Link
              href="/build"
              onClick={() => setOpen(false)}
              className="btn-primary w-full">
              ساندویچ خودت رو بساز
            </Link>
          </div>
        </aside>
      </div>
    </header>
  );
}
