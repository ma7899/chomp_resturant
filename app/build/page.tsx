import type { Metadata } from "next";
import BuildFlow from "@/components/BuildFlow";
import { getCurrentUser } from "@/lib/auth/session";
import { listUserCustomSandwiches } from "@/lib/server/customSandwiches";

export const metadata: Metadata = {
  title: "ساندویچ خودت رو بساز",
  description:
    "قدم به قدم ساندویچ مخصوص خودت رو بساز؛ یک پایه انتخاب کن، پروتئین، پنیر، سبزیجات و سس‌های دلخواه رو اضافه کن.",
};

export default async function BuildPage({
  searchParams,
}: {
  searchParams: { sandwich?: string };
}) {
  const user = await getCurrentUser();
  const saved = user ? await listUserCustomSandwiches(user.id) : [];

  return (
    <BuildFlow
      initialSlug={searchParams.sandwich}
      savedSandwiches={saved.map((s) => ({
        id: s.id,
        name: s.name,
        baseSlug: s.baseSlug,
        ingredientIds: s.ingredients.map((x) => x.ingredient.id),
      }))}
    />
  );
}
