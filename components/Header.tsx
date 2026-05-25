"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import Logo from "./Logo";
import { useCart, cartCount } from "@/lib/cart";
import clsx from "clsx";

const NAV = [
  { href: "/", label: "خانه" },
  { href: "/menu", label: "منو" },
  { href: "/build", label: "ساندویچ خودت رو بساز" },
  { href: "/about", label: "درباره ما" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const items = useCart((s) => s.items);
  const openCart = useCart((s) => s.open);
  const count = cartCount(items);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
              className="px-4 py-2 rounded-full text-ink-800 hover:text-brand-600 hover:bg-brand-50 transition-colors font-medium">
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
              <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {count}
              </span>
            )}
          </button>
          <Link
            href="/build"
            className="hidden sm:inline-flex btn-primary !py-2 !px-4 text-sm">
            سفارش آنلاین
          </Link>
          <button
            onClick={() => setOpen(true)}
            className="md:hidden btn-ghost !px-3 !py-2"
            aria-label="منو">
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={clsx(
          "fixed inset-0 z-50 md:hidden transition",
          open ? "visible" : "invisible",
        )}
        aria-hidden={!open}>
        <div
          onClick={() => setOpen(false)}
          className={clsx(
            "absolute inset-0 bg-black/40 transition-opacity",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          className={clsx(
            "absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl p-6 flex flex-col transition-transform",
            open ? "translate-x-0" : "translate-x-full",
          )}>
          <div className="flex items-center justify-between mb-8">
            <Logo className="h-9 w-auto" />
            <button
              onClick={() => setOpen(false)}
              className="btn-ghost !px-2 !py-2"
              aria-label="بستن">
              <X size={22} />
            </button>
          </div>
          <nav className="flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="px-4 py-3 rounded-xl text-lg font-medium hover:bg-brand-50 hover:text-brand-700">
                {n.label}
              </Link>
            ))}
          </nav>
          <Link
            href="/build"
            onClick={() => setOpen(false)}
            className="btn-primary mt-6 w-full">
            ساندویچ خودت رو بساز
          </Link>
        </aside>
      </div>
    </header>
  );
}
