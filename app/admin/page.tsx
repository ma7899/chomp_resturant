import Link from "next/link";
import {
  Activity,
  ChefHat,
  ClipboardList,
  Layers,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { Card, PageHeader } from "@/components/admin/AdminUI";
import { StatusPill } from "@/components/admin/StatusPill";
import { requireAdmin } from "@/lib/auth/session";
import { listAllOrders } from "@/lib/server/orders";
import { formatPrice } from "@/lib/format";
import { SEED_SANDWICHES, SEED_TOPPINGS } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireAdmin();
  
  const sandwiches = SEED_SANDWICHES;
  const toppings = SEED_TOPPINGS;
  const orders = await listAllOrders();

  const stats = {
    revenue: orders.reduce((sum, o) => sum + o.total, 0),
    itemsSold: orders.reduce(
      (sum, o) => sum + o.items.reduce((s2, i) => s2 + i.qty, 0),
      0,
    ),
  };

  // Aggregate qty per sandwich
  const perSandwich = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const o of orders) {
    for (const it of o.items) {
      const cur = perSandwich.get(it.sandwichSlug ?? "") ?? {
        name: it.name,
        qty: 0,
        revenue: 0,
      };
      cur.qty += it.qty;
      cur.revenue += it.lineTotal;
      perSandwich.set(it.sandwichSlug ?? "", cur);
    }
  }
  const topSandwiches = [...perSandwich.values()].sort(
    (a, b) => b.qty - a.qty,
  );

  // Daily revenue last 7 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days: { label: string; value: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const next = new Date(d);
    next.setDate(d.getDate() + 1);
    const sum = orders
      .filter((o) => {
        const od = new Date(o.createdAt);
        return od >= d && od < next;
      })
      .reduce((s, o) => s + o.total, 0);
    days.push({
      label: d.toLocaleDateString("fa-IR", { weekday: "short" }),
      value: sum,
    });
  }

  const reviews = 0; // TODO: fetch reviews count from DB

  return (
    <div className="space-y-6">
      <PageHeader
        title="داشبورد"
        subtitle="نمای کلی فروش و فعالیت رستوران"
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<TrendingUp size={18} />}
          label="درآمد کل"
          value={`${formatPrice(stats.revenue)} ت`}
          accent="from-emerald-500 to-emerald-600"
        />
        <StatCard
          icon={<ClipboardList size={18} />}
          label="تعداد سفارش"
          value={`${formatPrice(orders.length)}`}
          accent="from-brand-500 to-brand-600"
        />
        <StatCard
          icon={<ShoppingBag size={18} />}
          label="آیتم فروخته‌شده"
          value={`${formatPrice(stats.itemsSold)}`}
          accent="from-sky-500 to-sky-600"
        />
        <StatCard
          icon={<Activity size={18} />}
          label="نظر مشتری"
          value={`${formatPrice(reviews)}`}
          accent="from-violet-500 to-violet-600"
        />
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <Card>
          <header className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold">درآمد ۷ روز اخیر</h2>
              <p className="text-xs text-ink-500 mt-1">به تومان</p>
            </div>
          </header>
          <BarChart data={days} />
        </Card>

        <Card>
          <h2 className="font-bold mb-4">پرفروش‌ترین ساندویچ‌ها</h2>
          {topSandwiches.length === 0 && (
            <p className="text-sm text-ink-400 text-center py-8">
              هنوز سفارشی ثبت نشده است.
            </p>
          )}
          <ul className="space-y-2">
            {topSandwiches.slice(0, 5).map((s, i) => {
              const max = topSandwiches[0]?.qty || 1;
              return (
                <li key={i}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">{s.name}</span>
                    <span className="text-ink-500 tabular">
                      {s.qty} × — {formatPrice(s.revenue)} ت
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-l from-brand-500 to-brand-400"
                      style={{ width: `${(s.qty / max) * 100}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card>
          <h2 className="font-bold mb-1 flex items-center gap-2">
            <ChefHat size={16} className="text-brand-500" />
            ساندویچ‌ها
          </h2>
          <div className="price text-3xl text-ink-900 mt-2">
            {sandwiches.length}
          </div>
          <Link
            href="/admin/sandwiches"
            className="text-xs text-brand-600 mt-2 inline-block hover:underline">
            مدیریت ساندویچ‌ها ←
          </Link>
        </Card>
        <Card>
          <h2 className="font-bold mb-1 flex items-center gap-2">
            <Layers size={16} className="text-brand-500" />
            افزودنی‌ها
          </h2>
          <div className="price text-3xl text-ink-900 mt-2">
            {toppings.length}
          </div>
          <Link
            href="/admin/toppings"
            className="text-xs text-brand-600 mt-2 inline-block hover:underline">
            مدیریت افزودنی‌ها ←
          </Link>
        </Card>
        <Card>
          <h2 className="font-bold mb-1 flex items-center gap-2">
            <ClipboardList size={16} className="text-brand-500" />
            سفارش‌های جدید
          </h2>
          <div className="price text-3xl text-ink-900 mt-2">
            {orders.filter((o) => o.status === "NEW").length}
          </div>
          <Link
            href="/admin/orders"
            className="text-xs text-brand-600 mt-2 inline-block hover:underline">
            مشاهده‌ی همه ←
          </Link>
        </Card>
      </div>

      <Card>
        <header className="flex items-center justify-between mb-4">
          <h2 className="font-bold">آخرین سفارش‌ها</h2>
          <Link
            href="/admin/orders"
            className="text-xs text-brand-600 hover:underline">
            همه‌ی سفارش‌ها ←
          </Link>
        </header>
        {orders.length === 0 ? (
          <p className="text-sm text-ink-400 text-center py-8">
            فعلاً سفارشی ثبت نشده است.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-ink-500 text-right">
                <tr>
                  <th className="px-3 py-2 font-medium">مشتری</th>
                  <th className="px-3 py-2 font-medium">آیتم‌ها</th>
                  <th className="px-3 py-2 font-medium">مبلغ</th>
                  <th className="px-3 py-2 font-medium">وضعیت</th>
                  <th className="px-3 py-2 font-medium">تاریخ</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 6).map((o) => (
                  <tr key={o.id} className="border-t border-ink-100">
                    <td className="px-3 py-2.5 font-medium">
                      {o.customerName}
                    </td>
                    <td className="px-3 py-2.5 text-ink-500">
                      {o.items.reduce((s, i) => s + i.qty, 0)} آیتم
                    </td>
                    <td className="px-3 py-2.5 tabular font-bold">
                      {formatPrice(o.total)} ت
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusPill status={o.status} />
                    </td>
                    <td className="px-3 py-2.5 text-xs text-ink-400 tabular">
                      {new Date(o.createdAt).toLocaleDateString("fa-IR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-3xl bg-white border border-ink-100 p-5 relative overflow-hidden">
      <div
        className={`absolute -top-6 -left-6 w-24 h-24 rounded-full bg-gradient-to-bl ${accent} opacity-10`}
      />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-xs text-ink-500">{label}</p>
          <div className="price text-2xl text-ink-900 mt-1">{value}</div>
        </div>
        <span
          className={`w-10 h-10 rounded-2xl bg-gradient-to-bl ${accent} text-white flex items-center justify-center shadow`}>
          {icon}
        </span>
      </div>
    </div>
  );
}

function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end justify-between gap-2 h-48">
      {data.map((d, i) => {
        const h = (d.value / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div
              className="w-full bg-gradient-to-t from-brand-500 to-brand-300 rounded-t-xl relative group"
              style={{ height: `${Math.max(h, 4)}%` }}>
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] tabular font-bold bg-ink-900 text-white px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                {formatPrice(d.value)}
              </span>
            </div>
            <span className="text-[10px] text-ink-500">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

