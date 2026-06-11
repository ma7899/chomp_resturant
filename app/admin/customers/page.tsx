import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { listCustomers } from "@/lib/server/customers";
import { PageHeader, Card } from "@/components/admin/AdminUI";
import { Search, ChevronLeft, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  await requireAdmin();
  const search = searchParams.q?.trim() || undefined;
  const customers = await listCustomers(search);

  return (
    <div>
      <PageHeader
        title="مشتریان"
        subtitle="فهرست مشتریان، سفارش‌ها، تحلیل‌ها، تخفیف‌ها و دعوت‌ها."
      />

      <form action="/admin/customers" className="mb-4 flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"
          />
          <input
            name="q"
            defaultValue={search}
            placeholder="جستجو با نام یا شماره..."
            className="w-full rounded-xl border border-ink-100 bg-white px-10 py-2.5 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition"
          />
        </div>
        <button className="btn-primary !py-2 !px-4 text-sm">جستجو</button>
      </form>

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-50/60 text-ink-500">
              <tr>
                <th className="text-right font-medium px-4 py-3">مشتری</th>
                <th className="text-right font-medium px-4 py-3">شماره</th>
                <th className="text-right font-medium px-4 py-3">سفارش‌ها</th>
                <th className="text-right font-medium px-4 py-3">دعوت‌ها</th>
                <th className="text-right font-medium px-4 py-3"> </th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-ink-400 py-10">
                    <Users size={32} className="mx-auto mb-2 opacity-40" />
                    مشتری‌ای یافت نشد.
                  </td>
                </tr>
              )}
              {customers.map((c) => (
                <tr key={c.id} className="border-t border-ink-100">
                  <td className="px-4 py-3 font-semibold">{c.name || "—"}</td>
                  <td className="px-4 py-3 tabular" dir="ltr">
                    {c.phone}
                  </td>
                  <td className="px-4 py-3 tabular">
                    {c._count.orders.toLocaleString("fa-IR")}
                  </td>
                  <td className="px-4 py-3 tabular">
                    {c._count.invitees.toLocaleString("fa-IR")}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/customers/${c.id}`}
                      className="inline-flex items-center gap-1 text-brand-600 font-semibold hover:text-brand-700">
                      جزئیات <ChevronLeft size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
