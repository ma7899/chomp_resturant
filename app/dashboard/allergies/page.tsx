import { requireUser } from "@/lib/auth/session";
import { getIngredients } from "@/lib/server/catalog";
import { getUserAllergyIds } from "@/lib/server/allergies";
import AllergyManager from "@/components/dashboard/AllergyManager";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  protein: "پروتئین‌ها",
  veggie: "سبزیجات",
  cheese: "پنیرها",
  sauce: "سس‌ها",
  bread: "نان",
  extra: "افزودنی‌ها",
};

export default async function AllergiesPage() {
  const user = await requireUser("/dashboard/allergies");
  const [ingredients, selected] = await Promise.all([
    getIngredients(),
    getUserAllergyIds(user.id),
  ]);

  // Group by legacy category for a tidy UI.
  const groups = new Map<string, { id: string; name: string }[]>();
  for (const ing of ingredients) {
    const key = ing.legacyCategory ?? ing.category?.kind ?? "extra";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push({ id: ing.id, name: ing.name });
  }

  const grouped = Array.from(groups.entries()).map(([kind, items]) => ({
    kind,
    label: CATEGORY_LABELS[kind] ?? kind,
    items,
  }));

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display font-black text-2xl tracking-tight">
          حساسیت‌های غذایی
        </h1>
        <p className="text-ink-500 mt-1 text-sm leading-7">
          موادی که به آن‌ها حساسیت دارید را انتخاب کنید. هر ساندویچی که شامل این
          مواد باشد، هنگام ساخت یا سفارش به شما هشدار می‌دهیم.
        </p>
      </header>

      {ingredients.length === 0 ? (
        <div className="rounded-3xl bg-white border border-dashed border-ink-200 p-10 text-center text-ink-400">
          فهرست مواد هنوز بارگذاری نشده است. (اجرای <code>npm run db:seed</code>
          )
        </div>
      ) : (
        <AllergyManager groups={grouped} initialSelected={selected} />
      )}
    </div>
  );
}
