import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { listUserOrders } from "@/lib/server/orders";
import { getRateableForUser } from "@/lib/server/ratings";
import OrderHistory from "@/components/dashboard/OrderHistory";
import RatePanel from "@/components/dashboard/RatePanel";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await requireUser("/dashboard/orders");
  const [orders, rateable] = await Promise.all([
    listUserOrders(user.id),
    getRateableForUser(user.id),
  ]);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display font-black text-2xl tracking-tight">
          سفارش‌های من
        </h1>
        <p className="text-ink-500 mt-1 text-sm">
          تاریخچه‌ی سفارش‌ها، با امکان سفارش مجدد و افزودن به سبد خرید.
        </p>
      </header>

      <RatePanel
        items={rateable.map((r) => ({
          orderId: r.orderId,
          orderNumber: r.orderNumber,
          sandwichId: r.sandwichId,
          name: r.name,
          currentRating: r.currentRating,
          currentReview: r.currentReview,
        }))}
      />

      {orders.length === 0 ? (
        <div className="rounded-3xl bg-white border border-dashed border-ink-200 p-10 text-center text-ink-400">
          <ClipboardList size={40} className="mx-auto mb-3 opacity-40" />
          هنوز سفارشی ثبت نکرده‌اید.
          <div className="mt-4">
            <Link href="/menu" className="btn-primary inline-flex">
              مشاهده منو
            </Link>
          </div>
        </div>
      ) : (
        <OrderHistory
          orders={orders.map((o) => ({
            id: o.id,
            number: o.number,
            date: o.createdAt.toISOString(),
            status: o.status,
            total: o.total,
            items: o.items.map((it) => ({
              sandwichSlug: it.sandwichSlug,
              name: it.name,
              toppingIds: it.toppingIds,
              toppingNames: it.toppingNames,
              qty: it.qty,
              lineTotal: it.lineTotal,
            })),
          }))}
        />
      )}
    </div>
  );
}
