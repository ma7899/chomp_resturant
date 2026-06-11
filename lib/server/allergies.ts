import "server-only";
import { prisma } from "@/lib/db";

/**
 * Allergy management (Phase 9 / feature 6).
 *
 * The user marks which ingredients they're allergic to. Any sandwich that
 * contains one of those ingredients triggers a warning that names the exact
 * offending ingredients.
 */

export async function getUserAllergyIds(userId: string): Promise<string[]> {
  const rows = await prisma.userAllergy.findMany({
    where: { userId },
    select: { ingredientId: true },
  });
  return rows.map((r) => r.ingredientId);
}

export async function getUserAllergies(userId: string) {
  return prisma.userAllergy.findMany({
    where: { userId },
    include: { ingredient: true },
  });
}

/** Replace the user's full allergy set with the provided ingredient ids. */
export async function setUserAllergies(userId: string, ingredientIds: string[]) {
  const unique = Array.from(new Set(ingredientIds));
  await prisma.$transaction([
    prisma.userAllergy.deleteMany({ where: { userId } }),
    ...(unique.length
      ? [
          prisma.userAllergy.createMany({
            data: unique.map((ingredientId) => ({ userId, ingredientId })),
            skipDuplicates: true,
          }),
        ]
      : []),
  ]);
}

/**
 * Given a set of allergen ingredient ids and a list of ingredient ids present
 * in a sandwich, return the offending ingredients (id + name) — empty if safe.
 */
export async function checkAllergens(
  allergenIds: string[],
  ingredientIds: string[],
) {
  const allergenSet = new Set(allergenIds);
  const hits = ingredientIds.filter((id) => allergenSet.has(id));
  if (hits.length === 0) return [];
  return prisma.ingredient.findMany({
    where: { id: { in: hits } },
    select: { id: true, name: true },
  });
}
