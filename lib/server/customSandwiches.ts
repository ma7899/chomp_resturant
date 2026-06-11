import "server-only";
import { createHash } from "crypto";
import { prisma } from "@/lib/db";

/**
 * Custom / community sandwiches (features 2, 4, 7, 10).
 *
 * A custom sandwich = an optional base ready-sandwich (`baseSlug`) plus a set
 * of ingredient ids. We store a stable `recipeHash` so identical recipes are
 * de-duplicated (Phase 10): if a public recipe with the same hash already
 * exists we reuse it instead of creating a twin.
 */

/** Deterministic hash of base + sorted ingredient ids. */
export function computeRecipeHash(
  baseSlug: string | null,
  ingredientIds: string[],
): string {
  const sorted = [...ingredientIds].sort();
  const payload = `${baseSlug ?? "scratch"}::${sorted.join(",")}`;
  return createHash("sha1").update(payload).digest("hex");
}

export type SaveCustomInput = {
  creatorId: string;
  name: string;
  description?: string | null;
  baseSlug?: string | null;
  basePrice: number;
  isPublic: boolean;
  ingredientIds: string[];
};

export async function saveCustomSandwich(input: SaveCustomInput) {
  const recipeHash = computeRecipeHash(
    input.baseSlug ?? null,
    input.ingredientIds,
  );

  // De-dupe: if a public recipe with this hash exists, return it.
  if (input.isPublic) {
    const existing = await prisma.customSandwich.findFirst({
      where: { recipeHash, isPublic: true },
    });
    if (existing) return { sandwich: existing, deduped: true };
  }

  const sandwich = await prisma.customSandwich.create({
    data: {
      creatorId: input.creatorId,
      name: input.name,
      description: input.description ?? null,
      baseSlug: input.baseSlug ?? null,
      basePrice: input.basePrice,
      isPublic: input.isPublic,
      recipeHash,
      ingredients: {
        create: input.ingredientIds.map((ingredientId) => ({
          ingredientId,
          quantity: 1,
        })),
      },
    },
  });
  return { sandwich, deduped: false };
}

export async function listUserCustomSandwiches(userId: string) {
  return prisma.customSandwich.findMany({
    where: { creatorId: userId },
    orderBy: { createdAt: "desc" },
    include: { ingredients: { include: { ingredient: true } } },
  });
}

export async function getCustomSandwich(id: string) {
  return prisma.customSandwich.findUnique({
    where: { id },
    include: {
      ingredients: { include: { ingredient: true } },
      creator: { select: { name: true } },
    },
  });
}

export type CommunitySort = "newest" | "top_orders" | "top_rated" | "trending";

export type CommunityQuery = {
  search?: string;
  sort?: CommunitySort;
  page?: number;
  pageSize?: number;
};

/** Paginated public marketplace (feature 4) with search + sort. */
export async function listPublicCustomSandwiches(q: CommunityQuery) {
  const page = Math.max(1, q.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, q.pageSize ?? 12));

  const where = {
    isPublic: true,
    ...(q.search
      ? {
          OR: [
            { name: { contains: q.search, mode: "insensitive" as const } },
            {
              description: { contains: q.search, mode: "insensitive" as const },
            },
          ],
        }
      : {}),
  };

  const orderBy =
    q.sort === "top_orders"
      ? [{ totalOrders: "desc" as const }]
      : q.sort === "top_rated"
        ? [
            { averageRating: "desc" as const },
            { totalRatings: "desc" as const },
          ]
        : q.sort === "trending"
          ? // Trending = recent + ordered. Approximated by recency then orders.
            [{ createdAt: "desc" as const }, { totalOrders: "desc" as const }]
          : [{ createdAt: "desc" as const }];

  const [items, total] = await Promise.all([
    prisma.customSandwich.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        ingredients: { include: { ingredient: true } },
        creator: { select: { name: true } },
      },
    }),
    prisma.customSandwich.count({ where }),
  ]);

  return { items, total, page, pageSize, pages: Math.ceil(total / pageSize) };
}

/**
 * Ranking engine (Phase 7 / feature 4): blends average rating, order volume,
 * and recency into a single score. Returns the top N public recipes.
 */
export async function getTopCustomSandwiches(limit = 3) {
  // Pull a candidate window, then score in memory (cheap for marketplace size).
  const candidates = await prisma.customSandwich.findMany({
    where: { isPublic: true },
    orderBy: [{ totalOrders: "desc" }, { averageRating: "desc" }],
    take: 60,
    include: {
      ingredients: { include: { ingredient: true } },
      creator: { select: { name: true } },
    },
  });

  const now = Date.now();
  const scored = candidates
    .map((s) => {
      const ratingScore = s.averageRating * 2; // 0..10
      const orderScore = Math.log10(s.totalOrders + 1) * 4;
      const ageDays = (now - s.createdAt.getTime()) / 86_400_000;
      const recencyScore = Math.max(0, 3 - ageDays / 14); // fades over ~6 weeks
      return { sandwich: s, score: ratingScore + orderScore + recencyScore };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((x) => x.sandwich);
}

/** Increment order counters when a custom sandwich is purchased. */
export async function incrementCustomOrders(sandwichId: string, by = 1) {
  await prisma.customSandwich.update({
    where: { id: sandwichId },
    data: { totalOrders: { increment: by } },
  });
}
