import "server-only";
import { prisma } from "@/lib/db";

/**
 * Catalog read helpers backed by Postgres.
 *
 * These mirror the client-side seed catalog but read the persisted data so
 * server components (allergies, custom-sandwich builder, etc.) stay in sync
 * with anything the admin edits.
 */

export async function getIngredients() {
  return prisma.ingredient.findMany({
    orderBy: [{ legacyCategory: "asc" }, { name: "asc" }],
    include: { category: true },
  });
}

export async function getIngredientsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  return prisma.ingredient.findMany({ where: { id: { in: ids } } });
}

export async function getSandwiches() {
  return prisma.sandwich.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
}
