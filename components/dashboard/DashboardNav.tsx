"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  LayoutDashboard,
  ClipboardList,
  MapPin,
  ChefHat,
  ShieldAlert,
  Users,
  Store,
  LogOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { signOut } from "@/lib/auth/client";

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "نمای کلی", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "سفارش‌های من", icon: ClipboardList },
  { href: "/dashboard/saved", label: "ساندویچ‌های من", icon: ChefHat },
  { href: "/community", label: "مارکت ساندویچ", icon: Store },
  { href: "/dashboard/addresses", label: "آدرس‌ها", icon: MapPin },
  { href: "/dashboard/allergies", label: "حساسیت‌ها", icon: ShieldAlert },
  // { href: "/dashboard/referrals", label: "دعوت دوستان", icon: Users },
];

export default function DashboardNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      className={clsx(
        "rounded-3xl bg-white border border-ink-100 p-2",
        mobile && "flex gap-1 overflow-x-auto no-scrollbar",
      )}>
      {NAV.map((n) => {
        const active =
          pathname === n.href ||
          (n.href !== "/dashboard" && pathname.startsWith(n.href));
        const Icon = n.icon;
        return (
          <Link
            key={n.href}
            href={n.href}
            className={clsx(
              "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap",
              active
                ? "bg-brand-500 text-white shadow-glow"
                : "text-ink-700 hover:bg-brand-50 hover:text-brand-700",
            )}>
            <Icon size={18} />
            {n.label}
          </Link>
        );
      })}
      {!mobile && (
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-ink-500 hover:bg-red-50 hover:text-red-600 transition-colors">
          <LogOut size={18} />
          خروج از حساب
        </button>
      )}
    </nav>
  );
}
