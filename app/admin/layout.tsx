"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  ChefHat,
  ClipboardList,
  Layers,
  LogOut,
  MessageSquareText,
  Plus,
  Sparkles,
  Tag as TagIcon,
  Wand2,
  Menu as MenuIcon,
  X,
} from "lucide-react";
import clsx from "clsx";
import { useIsAdmin, signOut } from "@/lib/auth/client";

import type { LucideIcon } from "lucide-react";

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin", label: "داشبورد", icon: BarChart3 },
  { href: "/admin/sandwiches", label: "ساندویچ‌ها", icon: ChefHat },
  { href: "/admin/toppings", label: "افزودنی‌ها", icon: Layers },
  { href: "/admin/tags", label: "برچسب‌ها", icon: TagIcon },
  { href: "/admin/orders", label: "سفارش‌ها", icon: ClipboardList },
  { href: "/admin/reviews", label: "نظرات", icon: MessageSquareText },
  { href: "/admin/taste-form", label: "ذائقه‌سنج", icon: Wand2 },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAdmin, isLoading } = useIsAdmin();
  const [open, setOpen] = useState(false);

  // The edge middleware already blocks non-admins, but we guard the UI too.
  useEffect(() => {
    if (!isLoading && !isAdmin) router.replace("/");
  }, [isLoading, isAdmin, router]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-ink-400">
        در حال بارگذاری پنل...
      </div>
    );
  }
  if (!isAdmin) return null;

  return (
    <div className="bg-ink-50/40 min-h-[calc(100vh-4rem)]">
      <div className="lg:grid lg:grid-cols-[260px_1fr] container-x py-6 gap-6">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center">
              <Sparkles size={16} />
            </span>
            <span className="font-bold">پنل چاپ</span>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="btn-ghost !py-2 !px-3"
            aria-label="منو">
            <MenuIcon size={20} />
          </button>
        </div>

        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block">
          <Sidebar pathname={pathname || ""} onLogout={() => {
            signOut({ callbackUrl: "/" });
          }} />
        </aside>

        {/* Sidebar drawer (mobile) */}
        {open && (
          <div className="lg:hidden fixed inset-0 z-[60]">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <aside className="absolute top-0 right-0 h-full w-[85%] max-w-xs bg-white shadow-2xl flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <span className="font-bold">پنل چاپ</span>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 text-ink-500">
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 overflow-y-auto flex-1">
                <Sidebar
                  pathname={pathname || ""}
                  onLogout={() => {
                    signOut({ callbackUrl: "/" });
                  }}
                />
              </div>
            </aside>
          </div>
        )}

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}

function Sidebar({
  pathname,
  onLogout,
}: {
  pathname: string;
  onLogout: () => void;
}) {
  return (
    <nav className="rounded-3xl bg-white border border-ink-100 p-4 sticky top-24">
      <div className="hidden lg:flex items-center gap-3 px-3 pb-4 mb-2 border-b border-ink-100">
        <span className="w-10 h-10 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-glow">
          <Sparkles size={18} />
        </span>
        <div>
          <div className="font-display font-black tracking-tight">
            پنل چاپ
          </div>
          <div className="text-[10px] text-ink-500">مدیریت محتوای رستوران</div>
        </div>
      </div>
      <ul className="space-y-1">
        {NAV.map((n) => {
          const active =
            n.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(n.href);
          const Icon = n.icon;
          return (
            <li key={n.href}>
              <Link
                href={n.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition",
                  active
                    ? "bg-brand-500 text-white shadow-glow"
                    : "text-ink-700 hover:bg-brand-50 hover:text-brand-700",
                )}>
                <Icon size={16} />
                {n.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 pt-4 border-t border-ink-100 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-ink-600 hover:bg-ink-50">
          <Plus size={14} className="rotate-45" /> بازگشت به سایت
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-red-600 hover:bg-red-50">
          <LogOut size={14} /> خروج
        </button>
      </div>
    </nav>
  );
}
