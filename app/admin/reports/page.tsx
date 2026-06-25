import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import {
  resolveRange,
  getSalesReport,
  getGrowthReport,
  type RangeKey,
} from "@/lib/server/reports";
import { PageHeader, Card } from "@/components/admin/AdminUI";
import ReportsCustomRangeForm from "@/components/admin/ReportsCustomRangeForm";
import { formatPrice } from "@/lib/format";
import { Download, TrendingUp, ShoppingBag, Wallet, Users } from "lucide-react";

export const dynamic = "force-dynamic";

const RANGES: { id: RangeKey; label: string }[] = [
  { id: "today", label: "امروز" },
  { id: "week", label: "هفته" },
  { id: "month", label: "ماه" },
  { id: "year", label: "سال" },
  { id: "custom", label: "بازه دلخواه" },
];

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: { range?: string; from?: string; to?: string };
}) {
  await requireAdmin();
  const range = (RANGES.find((r) => r.id === searchParams.range)?.id ??
    "month") as RangeKey;
  const { from, to } = resolveRange(range, searchParams.from, searchParams.to);

  const [sales, growth] = await Promise.all([
    getSalesReport(from, to),
    getGrowthReport(from, to),
  ]);

  const maxDaily = Math.max(1, ...sales.daily.map((d) => d.revenue));
  const exportQ = new URLSearchParams({ range });
  if (searchParams.from) exportQ.set("from", searchParams.from);
  if (searchParams.to) exportQ.set("to", searchParams.to);

  return (
    <div>
      <PageHeader
        title="گزارش‌ها"
        subtitle="فروش، درآمد، مشتریان، دعوت‌ها و عملکرد ساندویچ‌ها در بازه‌های زمانی."
      />

      {/* Range selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {RANGES.map((r) => (
          <Link
            key={r.id}
            href={`/admin/reports?range=${r.id}`}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              r.id === range
                ? "bg-brand-500 text-white shadow-glow"
                : "bg-white border border-ink-100 text-ink-600 hover:border-brand-300"
            }`}>
            {r.label}
          </Link>
        ))}
      </div>

      {/* Custom range form */}
      {range === "custom" && (
        <ReportsCustomRangeForm from={searchParams.from} to={searchParams.to} />
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Kpi
          icon={<Wallet size={18} />}
          label="درآمد"
          value={`${formatPrice(sales.revenue)} ت`}
        />
        <Kpi
          icon={<ShoppingBag size={18} />}
          label="سفارش‌ها"
          value={sales.totalOrders.toLocaleString("fa-IR")}
        />
        <Kpi
          icon={<TrendingUp size={18} />}
          label="میانگین سفارش"
          value={`${formatPrice(sales.avgOrderValue)} ت`}
        />
        <Kpi
          icon={<Users size={18} />}
          label="مشتری جدید"
          value={growth.newCustomers.toLocaleString("fa-IR")}
        />
      </div>

      {/* Daily revenue chart */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">روند درآمد روزانه</h3>
          <a
            href={`/api/admin/reports/export?type=daily&${exportQ.toString()}`}
            className="inline-flex items-center gap-1 text-sm text-brand-600 font-semibold hover:text-brand-700">
            <Download size={15} /> خروجی CSV
          </a>
        </div>
        {sales.daily.length === 0 ? (
          <p className="text-sm text-ink-400">
            داده‌ای در این بازه وجود ندارد.
          </p>
        ) : (
          <div className="flex items-end gap-1 h-40 overflow-x-auto">
            {sales.daily.map((d) => (
              <div
                key={d.date}
                className="flex-1 min-w-[8px] flex flex-col items-center gap-1"
                title={`${d.date}: ${formatPrice(d.revenue)}`}>
                <div
                  className="w-full rounded-t bg-brand-400 hover:bg-brand-500 transition"
                  style={{ height: `${(d.revenue / maxDaily) * 100}%` }}
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Sandwich performance + ingredients */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">عملکرد ساندویچ‌ها</h3>
            <a
              href={`/api/admin/reports/export?type=sandwiches&${exportQ.toString()}`}
              className="inline-flex items-center gap-1 text-sm text-brand-600 font-semibold hover:text-brand-700">
              <Download size={15} /> CSV
            </a>
          </div>
          <Table
            rows={sales.sandwiches
              .slice(0, 10)
              .map((s) => [
                s.name,
                s.qty.toLocaleString("fa-IR"),
                `${formatPrice(s.revenue)} ت`,
              ])}
            headers={["ساندویچ", "تعداد", "درآمد"]}
          />
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">مصرف مواد اولیه</h3>
            <a
              href={`/api/admin/reports/export?type=ingredients&${exportQ.toString()}`}
              className="inline-flex items-center gap-1 text-sm text-brand-600 font-semibold hover:text-brand-700">
              <Download size={15} /> CSV
            </a>
          </div>
          <Table
            rows={sales.ingredients
              .slice(0, 10)
              .map((s) => [s.name, s.qty.toLocaleString("fa-IR")])}
            headers={["ماده", "مصرف"]}
          />
        </Card>
      </div>
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
        {icon}
      </div>
      <div className="text-xs text-ink-400 mt-3">{label}</div>
      <div className="font-display font-extrabold text-xl mt-0.5 tabular">
        {value}
      </div>
    </Card>
  );
}

function Table({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | number)[][];
}) {
  if (rows.length === 0)
    return <p className="text-sm text-ink-400">داده‌ای موجود نیست.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-ink-500">
          <tr>
            {headers.map((h) => (
              <th key={h} className="text-right font-medium pb-2">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-ink-100">
              {r.map((c, j) => (
                <td key={j} className="py-2 tabular">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
