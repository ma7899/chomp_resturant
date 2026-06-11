import { requireUser } from "@/lib/auth/session";
import { getReferralOverview } from "@/lib/server/referrals";
import { formatPercent, formatDateFa } from "@/lib/format";
import ReferralShare from "@/components/dashboard/ReferralShare";
import { Users, UserCheck, MousePointerClick, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReferralsPage() {
  const user = await requireUser("/dashboard/referrals");
  const data = await getReferralOverview(user.id);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display font-black text-2xl tracking-tight">
          دعوت دوستان
        </h1>
        <p className="text-ink-500 mt-1 text-sm leading-7">
          دوستانت رو دعوت کن! با کد یا لینک اختصاصی تو ثبت‌نام کنند تا برای هردو
          امتیاز ثبت شود.
        </p>
      </header>

      <ReferralShare code={data.referralCode} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Stat
          icon={<MousePointerClick size={18} />}
          label="کلیک روی لینک"
          value={data.clicks}
        />
        <Stat
          icon={<Users size={18} />}
          label="ثبت‌نام‌شده"
          value={data.registered}
        />
        <Stat
          icon={<UserCheck size={18} />}
          label="خرید کرده"
          value={data.converted}
        />
        <Stat
          icon={<TrendingUp size={18} />}
          label="نرخ تبدیل"
          value={formatPercent(data.conversionRate)}
          isText
        />
      </div>

      <div className="rounded-3xl bg-white border border-ink-100 overflow-hidden">
        <div className="p-5 border-b border-ink-100">
          <h2 className="font-bold">دوستان دعوت‌شده</h2>
        </div>
        {data.invitees.length === 0 ? (
          <div className="p-10 text-center text-ink-400 text-sm">
            هنوز کسی با کد شما ثبت‌نام نکرده است.
          </div>
        ) : (
          <ul className="divide-y divide-ink-100">
            {data.invitees.map((inv) => (
              <li
                key={inv.id}
                className="flex items-center justify-between p-4 text-sm">
                <div>
                  <div className="font-semibold">{inv.name || "کاربر"}</div>
                  <div className="text-xs text-ink-400 tabular" dir="ltr">
                    {inv.phone}
                  </div>
                </div>
                <div className="text-left">
                  <span
                    className={`chip text-[11px] ${
                      inv.converted
                        ? "!bg-green-50 !text-green-700"
                        : "!bg-ink-100 !text-ink-500"
                    }`}>
                    {inv.converted ? "خرید کرده" : "ثبت‌نام‌شده"}
                  </span>
                  <div className="text-[11px] text-ink-400 mt-1">
                    {formatDateFa(inv.joinedAt)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  isText = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  isText?: boolean;
}) {
  return (
    <div className="rounded-3xl bg-white border border-ink-100 p-4">
      <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
        {icon}
      </div>
      <div className="text-xs text-ink-400 mt-3">{label}</div>
      <div className="font-display font-extrabold text-xl mt-0.5 tabular">
        {isText ? value : Number(value).toLocaleString("fa-IR")}
      </div>
    </div>
  );
}
