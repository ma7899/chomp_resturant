import "server-only";
import { prisma } from "@/lib/db";

/** Categories admin repository (feature: category CRUD). */

export async function listCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { ingredients: true } } },
  });
}

export type CategoryInput = {
  name: string;
  slug: string;
  kind: string;
  sortOrder: number;
};

export async function createCategory(data: CategoryInput) {
  return prisma.category.create({
    data: { ...data, slug: data.slug.toLowerCase() },
  });
}

export async function updateCategory(id: string, data: CategoryInput) {
  return prisma.category.update({
    where: { id },
    data: { ...data, slug: data.slug.toLowerCase() },
  });
}

export async function deleteCategory(id: string) {
  // Detach ingredients (SetNull) happens automatically via the relation.
  await prisma.category.delete({ where: { id } });
}
