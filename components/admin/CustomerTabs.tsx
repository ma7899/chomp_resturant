"use client";

import { useState, useTransition } from "react";
import clsx from "clsx";
import {
  User,
  ClipboardList,
  BarChart3,
  Ticket,
  Share2,
  Lightbulb,
  Check,
  Plus,
} from "lucide-react";
import { formatPrice, formatDateFa, formatPercent } from "@/lib/format";
import {
  assignCustomerDiscountAction,
  removeCustomerDiscountAction,
} from "@/app/admin/actions";

type Tab = "profile" | "orders" | "analytics" | "discounts" | "referrals";

const WEEKDAYS = ["یک", "دو", "سه", "چهار", "پنج", "جمعه", "شنبه"]; // Sun..Sat

type Analytics = {
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  topItems: { name: string; count: number }[];
  topIngredients: { name: string; count: number }[];
  byHour: number[];
  byWeekday: number[];
  byMonth: { month: string; count: number }[];
  daysSinceLast: number | null;
  recommendations: string[];
};

export default function CustomerTabs({
  customerId,
  profile,
  orders,
  analytics,
  referral,
  discounts,
}: {
  customerId: string;
  profile: {
    name: string | null;
    phone: string;
    referralCode: string;
    createdAt: string;
    addresses: { id: string; title: string; text: string }[];
    assignedDiscountIds: string[];
  };
  orders: {
    id: string;
    number: number;
    date: string;
    status: string;
    total: number;
    itemCount: number;
  }[];
  analytics: Analytics;
  referral: { registered: number; converted: number; conversionRate: number };
  discounts: { id: string; code: string; isActive: boolean }[];
}) {
  const [tab, setTab] = useState<Tab>("profile");
  const [assigned, setAssigned] = useState<string[]>(
    profile.assignedDiscountIds,
  );
  const [pending, startTransition] = useTransition();

  const TABS: { id: Tab; label: string; icon: typeof User }[] = [
    { id: "profile", label: "پروفایل", icon: User },
    { id: "orders", label: "سفارش‌ها", icon: ClipboardList },
    { id: "analytics", label: "تحلیل‌ها", icon: BarChart3 },
    { id: "discounts", label: "تخفیف‌ها", icon: Ticket },
    { id: "referrals", label: "دعوت‌ها", icon: Share2 },
  ];

  function toggleDiscount(id: string) {
    const isAssigned = assigned.includes(id);
    startTransition(async () => {
      if (isAssigned) {
        await removeCustomerDiscountAction(customerId, id);
        setAssigned((p) => p.filter((x) => x !== id));
      } else {
        await assignCustomerDiscountAction(customerId, id);
        setAssigned((p) => [...p, id]);
      }
    });
  }

  const maxHour = Math.max(1, ...analytics.byHour);
  const maxWeekday = Math.max(1, ...analytics.byWeekday);

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar border-b border-ink-100 mb-6">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={clsx(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition",
                tab === t.id
                  ? "border-brand-500 text-brand-600"
                  : "border-transparent text-ink-500 hover:text-ink-800",
              )}>
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* PROFILE */}
      {tab === "profile" && (
        <div className="grid sm:grid-cols-2 gap-4">
          <InfoCard label="نام">{profile.name || "—"}</InfoCard>
          <InfoCard label="شماره موبایل">
            <span dir="ltr" className="tabular">
              {profile.phone}
            </span>
          </InfoCard>
          <InfoCard label="کد دعوت">
            <span className="tabular">{profile.referralCode}</span>
          </InfoCard>
          <InfoCard label="عضویت از">
            {formatDateFa(profile.createdAt)}
          </InfoCard>
          <div className="sm:col-span-2 rounded-3xl bg-white border border-ink-100 p-5">
            <div className="text-xs text-ink-400 mb-2">آدرس‌ها</div>
            {profile.addresses.length === 0 ? (
              <p className="text-sm text-ink-400">آدرسی ثبت نشده.</p>
            ) : (
              <ul className="space-y-2">
                {profile.addresses.map((a) => (
                  <li key={a.id} className="text-sm">
                    <span className="font-semibold">{a.title}:</span> {a.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* ORDERS */}
      {tab === "orders" && (
        <div className="rounded-3xl bg-white border border-ink-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-50/60 text-ink-500">
              <tr>
                <th className="text-right font-medium px-4 py-3">شماره</th>
                <th className="text-right font-medium px-4 py-3">تاریخ</th>
                <th className="text-right font-medium px-4 py-3">آیتم</th>
                <th className="text-right font-medium px-4 py-3">مبلغ</th>
                <th className="text-right font-medium px-4 py-3">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-ink-400 py-10">
                    سفارشی ثبت نشده.
                  </td>
                </tr>
              )}
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-ink-100">
                  <td className="px-4 py-3 tabular">
                    #{o.number.toLocaleString("fa-IR")}
                  </td>
                  <td className="px-4 py-3 text-xs">{formatDateFa(o.date)}</td>
                  <td className="px-4 py-3 tabular">
                    {o.itemCount.toLocaleString("fa-IR")}
                  </td>
                  <td className="px-4 py-3 tabular font-semibold">
                    {formatPrice(o.total)}
                  </td>
                  <td className="px-4 py-3 text-xs">{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ANALYTICS */}
      {tab === "analytics" && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            <InfoCard label="مجموع خرید">
              {formatPrice(analytics.totalSpent)} ت
            </InfoCard>
            <InfoCard label="میانگین هر سفارش">
              {formatPrice(analytics.avgOrderValue)} ت
            </InfoCard>
            <InfoCard label="آخرین خرید">
              {analytics.daysSinceLast == null
                ? "—"
                : `${analytics.daysSinceLast.toLocaleString("fa-IR")} روز پیش`}
            </InfoCard>
          </div>

          {/* Recommendations */}
          {analytics.recommendations.length > 0 && (
            <div className="rounded-3xl bg-amber-50 border border-amber-200 p-5">
              <div className="flex items-center gap-2 font-bold text-amber-800 mb-2">
                <Lightbulb size={18} /> پیشنهادها برای این مشتری
              </div>
              <ul className="space-y-1.5 text-sm text-amber-900 list-disc pr-5">
                {analytics.recommendations.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="rounded-3xl bg-white border border-ink-100 p-5">
              <h3 className="font-bold mb-3">ساندویچ‌های محبوب</h3>
              <BarList items={analytics.topItems} />
            </div>
            <div className="rounded-3xl bg-white border border-ink-100 p-5">
              <h3 className="font-bold mb-3">مواد محبوب</h3>
              <BarList items={analytics.topIngredients} />
            </div>
          </div>

          {/* Hourly heatmap */}
          <div className="rounded-3xl bg-white border border-ink-100 p-5">
            <h3 className="font-bold mb-3">ساعت خرید</h3>
            <div className="flex items-end gap-1 h-28">
              {analytics.byHour.map((v, h) => (
                <div
                  key={h}
                  className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-brand-400"
                    style={{ height: `${(v / maxHour) * 100}%` }}
                    title={`ساعت ${h}: ${v}`}
                  />
                  {h % 3 === 0 && (
                    <span className="text-[9px] text-ink-400 tabular">{h}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Weekday heatmap */}
          <div className="rounded-3xl bg-white border border-ink-100 p-5">
            <h3 className="font-bold mb-3">روز هفته</h3>
            <div className="flex items-end gap-2 h-24">
              {analytics.byWeekday.map((v, d) => (
                <div
                  key={d}
                  className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-brand-500"
                    style={{ height: `${(v / maxWeekday) * 100}%` }}
                  />
                  <span className="text-[10px] text-ink-400">
                    {WEEKDAYS[d]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DISCOUNTS */}
      {tab === "discounts" && (
        <div className="rounded-3xl bg-white border border-ink-100 p-5">
          <h3 className="font-bold mb-3">تخفیف‌های اختصاصی این مشتری</h3>
          <div className="space-y-2">
            {discounts.map((d) => {
              const isOn = assigned.includes(d.id);
              return (
                <div
                  key={d.id}
                  className="flex items-center justify-between rounded-xl border border-ink-100 px-4 py-3">
                  <span className="font-semibold tabular">
                    {d.code}{" "}
                    {!d.isActive && (
                      <span className="text-xs text-ink-400">(غیرفعال)</span>
                    )}
                  </span>
                  <button
                    onClick={() => toggleDiscount(d.id)}
                    disabled={pending}
                    className={clsx(
                      "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold transition",
                      isOn
                        ? "bg-green-50 text-green-700"
                        : "bg-brand-50 text-brand-600 hover:bg-brand-100",
                    )}>
                    {isOn ? (
                      <>
                        <Check size={15} /> اختصاص داده شده
                      </>
                    ) : (
                      <>
                        <Plus size={15} /> اختصاص بده
                      </>
                    )}
                  </button>
                </div>
              );
            })}
            {discounts.length === 0 && (
              <p className="text-sm text-ink-400">تخفیفی تعریف نشده است.</p>
            )}
          </div>
        </div>
      )}

      {/* REFERRALS */}
      {tab === "referrals" && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <InfoCard label="کد دعوت">
            <span className="tabular">{profile.referralCode}</span>
          </InfoCard>
          <InfoCard label="ثبت‌نام با دعوت">
            {referral.registered.toLocaleString("fa-IR")}
          </InfoCard>
          <InfoCard label="تبدیل به خریدار">
            {referral.converted.toLocaleString("fa-IR")}
          </InfoCard>
          <InfoCard label="نرخ تبدیل">
            {formatPercent(referral.conversionRate)}
          </InfoCard>
        </div>
      )}
    </div>
  );
}

function InfoCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-white border border-ink-100 p-5">
      <div className="text-xs text-ink-400">{label}</div>
      <div className="font-display font-extrabold text-lg mt-1 tracking-tight">
        {children}
      </div>
    </div>
  );
}

function BarList({ items }: { items: { name: string; count: number }[] }) {
  if (items.length === 0)
    return <p className="text-sm text-ink-400">داده‌ای موجود نیست.</p>;
  const max = Math.max(...items.map((i) => i.count));
  return (
    <div className="space-y-2">
      {items.map((it) => (
        <div key={it.name}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span>{it.name}</span>
            <span className="tabular text-ink-400">
              {it.count.toLocaleString("fa-IR")}
            </span>
          </div>
          <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
            <div
              className="h-full bg-brand-500"
              style={{ width: `${(it.count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
