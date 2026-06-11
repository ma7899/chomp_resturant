import { requireAdmin } from "@/lib/auth/session";
import { listCategories } from "@/lib/server/categories";
import CategoriesManager from "@/components/admin/CategoriesManager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const categories = await listCategories();

  return (
    <CategoriesManager
      initial={categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        kind: c.kind,
        sortOrder: c.sortOrder,
        count: c._count.ingredients,
      }))}
    />
  );
}
