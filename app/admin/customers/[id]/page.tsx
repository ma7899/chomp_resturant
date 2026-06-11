import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import {
  getCustomerProfile,
  getCustomerOrders,
  getCustomerAnalytics,
} from "@/lib/server/customers";
import { listDiscounts } from "@/lib/server/discounts";
import { getReferralOverview } from "@/lib/server/referrals";
import { PageHeader } from "@/components/admin/AdminUI";
import CustomerTabs from "@/components/admin/CustomerTabs";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdmin();
  const profile = await getCustomerProfile(params.id);
  if (!profile) notFound();

  const [orders, analytics, allDiscounts, referral] = await Promise.all([
    getCustomerOrders(params.id),
    getCustomerAnalytics(params.id),
    listDiscounts(),
    getReferralOverview(params.id),
  ]);

  return (
    <div>
      <Link
        href="/admin/customers"
        className="text-sm text-ink-500 hover:text-brand-600">
        ← بازگشت به فهرست مشتریان
      </Link>
      <div className="mt-3">
        <PageHeader title={profile.name || "مشتری"} subtitle={profile.phone} />
      </div>

      <CustomerTabs
        customerId={profile.id}
        profile={{
          name: profile.name,
          phone: profile.phone,
          referralCode: profile.referralCode,
          createdAt: profile.createdAt.toISOString(),
          addresses: profile.addresses.map((a) => ({
            id: a.id,
            title: a.title,
            text: `${a.province}، ${a.city}، ${a.street}`,
          })),
          assignedDiscountIds: profile.customerDiscounts.map(
            (cd) => cd.discountId,
          ),
        }}
        orders={orders.map((o) => ({
          id: o.id,
          number: o.number,
          date: o.createdAt.toISOString(),
          status: o.status,
          total: o.total,
          itemCount: o.items.reduce((s, it) => s + it.qty, 0),
        }))}
        analytics={analytics}
        referral={{
          registered: referral.registered,
          converted: referral.converted,
          conversionRate: referral.conversionRate,
        }}
        discounts={allDiscounts.map((d) => ({
          id: d.id,
          code: d.code,
          isActive: d.isActive,
        }))}
      />
    </div>
  );
}
