import Link from "next/link";
import {
  ClipboardList,
  Wallet,
  ChefHat,
  MapPin,
  ShieldAlert,
  Users,
  ArrowLeft,
} from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getUserOrderStats } from "@/lib/server/orders";
import { getReferralOverview } from "@/lib/server/referrals";
import { getUserAllergyIds } from "@/lib/server/allergies";
import { listAddresses } from "@/lib/server/addresses";
import { formatPrice, formatPercent } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardOverview() {
  const user = await requireUser("/dashboard");

  const [stats, referral, allergyIds, addresses] = await Promise.all([
    getUserOrderStats(user.id),
    getReferralOverview(user.id),
    getUserAllergyIds(user.id),
    listAddresses(user.id),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display font-black text-2xl md:text-3xl tracking-tight">
          سلام {user.name || "دوست چامپی"} 👋
        </h1>
        <p className="text-ink-500 mt-1 text-sm">
          خلاصه‌ی حساب و فعالیت شما در چامپ.
        </p>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Stat
          icon={<ClipboardList size={20} />}
          label="تعداد سفارش‌ها"
          value={stats.totalOrders.toLocaleString("fa-IR")}
        />
        {/* <Stat
          icon={<Wallet size={20} />}
          label="مجموع خرید"
          value={`${formatPrice(stats.totalSpent)} ت`}
        /> */}
        <Stat
          icon={<ChefHat size={20} />}
          label="ساندویچ محبوب"
          value={stats.favorite ?? "—"}
        />
        {/* <Stat
          icon={<Users size={20} />}
          label="دعوت‌شده‌ها"
          value={referral.registered.toLocaleString("fa-IR")}
          hint={`نرخ تبدیل ${formatPercent(referral.conversionRate)}`}
        /> */}
        <Stat
          icon={<MapPin size={20} />}
          label="آدرس‌ها"
          value={addresses.length.toLocaleString("fa-IR")}
        />
        <Stat
          icon={<ShieldAlert size={20} />}
          label="حساسیت‌های ثبت‌شده"
          value={allergyIds.length.toLocaleString("fa-IR")}
        />
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <QuickAction
          href="/build"
          title="ساخت ساندویچ جدید"
          desc="ساندویچ دلخواهت رو از صفر بساز و ثبت کن."
        />
        <QuickAction
          href="/community"
          title="ساندویچ دیگران"
          desc="ترکیب‌های محبوب مشتری‌ها رو ببین و سفارش بده."
        />
        <QuickAction
          href="/dashboard/orders"
          title="سفارش مجدد"
          desc="از تاریخچه، سریع دوباره سفارش بده."
        />
        <QuickAction
          href="/dashboard/referrals"
          title="دعوت دوستان"
          desc={`کد دعوت تو: ${referral.referralCode}`}
        />
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-3xl bg-white border border-ink-100 p-4 sm:p-5">
      <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
        {icon}
      </div>
      <div className="text-xs text-ink-400 mt-3">{label}</div>
      <div className="font-display font-extrabold text-lg mt-0.5 tracking-tight truncate">
        {value}
      </div>
      {hint && <div className="text-[11px] text-ink-400 mt-1">{hint}</div>}
    </div>
  );
}

function QuickAction({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl bg-white border border-ink-100 p-5 flex items-center justify-between hover:border-brand-300 hover:shadow-card transition">
      <div>
        <div className="font-bold">{title}</div>
        <div className="text-sm text-ink-500 mt-1">{desc}</div>
      </div>
      <ArrowLeft
        size={20}
        className="text-ink-300 group-hover:text-brand-500 transition"
      />
    </Link>
  );
}
