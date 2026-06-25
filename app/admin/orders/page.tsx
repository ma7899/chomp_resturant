import { PageHeader } from "@/components/admin/AdminUI";
import { OrdersClient } from "@/components/admin/OrdersClient";
import { requireAdmin } from "@/lib/auth/session";
import { listAllOrders } from "@/lib/server/orders";

export const dynamic = "force-dynamic";

export default async function OrdersAdmin() {
  await requireAdmin();
  const orders = await listAllOrders();

  return (
    <div className="space-y-6">
      <PageHeader
        title="سفارش‌ها"
        subtitle="مدیریت سفارش‌های ثبت‌شده توسط مشتری‌ها."
      />

      <OrdersClient orders={orders} />
    </div>
  );
}
