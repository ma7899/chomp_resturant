import { requireAdmin } from "@/lib/auth/session";
import { listDiscounts } from "@/lib/server/discounts";
import DiscountsManager from "@/components/admin/DiscountsManager";

export const dynamic = "force-dynamic";

export default async function AdminDiscountsPage() {
  await requireAdmin();
  const discounts = await listDiscounts();

  return (
    <DiscountsManager
      initial={discounts.map((d) => ({
        id: d.id,
        code: d.code,
        type: d.type,
        percentage: d.percentage,
        fixedAmount: d.fixedAmount,
        minPurchase: d.minPurchase,
        maxDiscount: d.maxDiscount,
        startDate: d.startDate ? d.startDate.toISOString().slice(0, 10) : null,
        endDate: d.endDate ? d.endDate.toISOString().slice(0, 10) : null,
        usageLimit: d.usageLimit,
        usagePerUser: d.usagePerUser,
        isActive: d.isActive,
        used: d._count.redemptions,
      }))}
    />
  );
}
