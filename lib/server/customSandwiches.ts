import "server-only";
import { createHash } from "crypto";
import { prisma } from "@/lib/db";

/**
 * Custom / community sandwiches (features 2, 4, 7, 10).
 *
 * A custom sandwich = an optional base ready-sandwich (`baseSlug`) plus a set
 * of ingredient ids. We store a stable `recipeHash` and enforce public
 * uniqueness by ingredient composition vs menu and marketplace.
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

function normalizeIngredientSet(names: string[]) {
  return Array.from(
    new Set(names.map((n) => n.trim().toLowerCase()).filter(Boolean)),
  ).sort();
}

function equalNormalizedSets(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function equalIdSets(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  for (let i = 0; i < sa.length; i += 1) {
    if (sa[i] !== sb[i]) return false;
  }
  return true;
}

async function hasUserOrderedRecipe(
  userId: string,
  baseSlug: string | null,
  ingredientIds: string[],
) {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 120,
  });

  return orders.some((o) =>
    o.items.some((it) => {
      if (baseSlug) {
        if (it.sandwichSlug !== baseSlug) return false;
        return equalIdSets(it.toppingIds, ingredientIds);
      }
      if (!it.customSandwichId) return false;
      return equalIdSets(it.toppingIds, ingredientIds);
    }),
  );
}

async function getFullIngredientSetForRecipe(
  baseSlug: string | null,
  ingredientIds: string[],
) {
  const uniqueIngredientIds = Array.from(new Set(ingredientIds));
  const [base, ingredients] = await Promise.all([
    baseSlug
      ? prisma.sandwich.findUnique({
          where: { slug: baseSlug },
          select: { includedIngredients: true },
        })
      : null,
    uniqueIngredientIds.length > 0
      ? prisma.ingredient.findMany({
          where: { id: { in: uniqueIngredientIds } },
          select: { name: true },
        })
      : [],
  ]);

  const ingredientNames = ingredients.map((i) => i.name);
  const baseIngredients = base?.includedIngredients ?? [];
  return normalizeIngredientSet([...baseIngredients, ...ingredientNames]);
}

async function recipeExistsInMenuByIngredients(targetSet: string[]) {
  const menu = await prisma.sandwich.findMany({
    select: { includedIngredients: true },
  });
  return menu.some((s) =>
    equalNormalizedSets(
      normalizeIngredientSet(s.includedIngredients),
      targetSet,
    ),
  );
}

async function recipeExistsInPublicMarketByIngredients(
  targetSet: string[],
  excludeSandwichId?: string,
) {
  const publicRecipes = await prisma.customSandwich.findMany({
    where: {
      isPublic: true,
      ...(excludeSandwichId ? { id: { not: excludeSandwichId } } : {}),
    },
    select: {
      id: true,
      baseSlug: true,
      ingredients: {
        select: {
          ingredient: { select: { name: true } },
        },
      },
    },
  });

  const slugs = Array.from(
    new Set(
      publicRecipes.map((r) => r.baseSlug).filter((x): x is string => !!x),
    ),
  );
  const bases = slugs.length
    ? await prisma.sandwich.findMany({
        where: { slug: { in: slugs } },
        select: { slug: true, includedIngredients: true },
      })
    : [];
  const baseBySlug = new Map(bases.map((b) => [b.slug, b.includedIngredients]));

  return publicRecipes.some((r) => {
    const baseIngredients = r.baseSlug
      ? (baseBySlug.get(r.baseSlug) ?? [])
      : [];
    const ingredientNames = r.ingredients.map((x) => x.ingredient.name);
    const recipeSet = normalizeIngredientSet([
      ...baseIngredients,
      ...ingredientNames,
    ]);
    return equalNormalizedSets(recipeSet, targetSet);
  });
}

async function assertUniquePublicRecipeByIngredients(
  baseSlug: string | null,
  ingredientIds: string[],
  excludeSandwichId?: string,
) {
  const targetSet = await getFullIngredientSetForRecipe(
    baseSlug,
    ingredientIds,
  );
  if (await recipeExistsInMenuByIngredients(targetSet)) {
    throw new Error("RECIPE_EXISTS_IN_MENU");
  }
  if (
    await recipeExistsInPublicMarketByIngredients(targetSet, excludeSandwichId)
  ) {
    throw new Error("RECIPE_EXISTS_IN_MARKET");
  }
}

export async function saveCustomSandwich(input: SaveCustomInput) {
  if (input.isPublic) {
    const ordered = await hasUserOrderedRecipe(
      input.creatorId,
      input.baseSlug ?? null,
      input.ingredientIds,
    );
    if (!ordered) {
      throw new Error("ORDER_REQUIRED_FOR_PUBLIC");
    }

    await assertUniquePublicRecipeByIngredients(
      input.baseSlug ?? null,
      input.ingredientIds,
    );
  }

  const recipeHash = computeRecipeHash(
    input.baseSlug ?? null,
    input.ingredientIds,
  );

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

export async function deleteUserCustomSandwich(
  userId: string,
  sandwichId: string,
) {
  const found = await prisma.customSandwich.findFirst({
    where: { id: sandwichId, creatorId: userId },
    select: { id: true },
  });
  if (!found) throw new Error("CUSTOM_NOT_FOUND");
  await prisma.customSandwich.delete({ where: { id: sandwichId } });
}

export async function publishUserCustomSandwich(
  userId: string,
  sandwichId: string,
) {
  const found = await prisma.customSandwich.findFirst({
    where: { id: sandwichId, creatorId: userId },
    select: {
      id: true,
      baseSlug: true,
      ingredients: { select: { ingredientId: true } },
    },
  });
  if (!found) throw new Error("CUSTOM_NOT_FOUND");

  const ingredientIds = found.ingredients.map((x) => x.ingredientId);
  const ordered = await hasUserOrderedRecipe(
    userId,
    found.baseSlug ?? null,
    ingredientIds,
  );
  if (!ordered) throw new Error("ORDER_REQUIRED_FOR_PUBLIC");

  await assertUniquePublicRecipeByIngredients(
    found.baseSlug ?? null,
    ingredientIds,
    found.id,
  );

  await prisma.customSandwich.update({
    where: { id: found.id },
    data: { isPublic: true },
  });
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

export async function getPublicCustomSandwichById(id: string) {
  return prisma.customSandwich.findFirst({
    where: { id, isPublic: true },
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
