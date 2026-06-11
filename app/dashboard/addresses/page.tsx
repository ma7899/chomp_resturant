import { requireUser } from "@/lib/auth/session";
import { listAddresses } from "@/lib/server/addresses";
import AddressManager from "@/components/dashboard/AddressManager";

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const user = await requireUser("/dashboard/addresses");
  const addresses = await listAddresses(user.id);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display font-black text-2xl tracking-tight">
          آدرس‌های من
        </h1>
        <p className="text-ink-500 mt-1 text-sm">
          آدرس‌های تحویل خود را مدیریت کنید. یک آدرس به‌عنوان پیش‌فرض انتخاب
          می‌شود.
        </p>
      </header>

      <AddressManager
        initial={addresses.map((a) => ({
          id: a.id,
          title: a.title,
          province: a.province,
          city: a.city,
          street: a.street,
          alley: a.alley,
          buildingNumber: a.buildingNumber,
          unit: a.unit,
          postalCode: a.postalCode,
          isDefault: a.isDefault,
        }))}
      />
    </div>
  );
}
