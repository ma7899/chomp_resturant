import "server-only";
import { prisma } from "@/lib/db";

/**
 * Rating system (Phase 8 / feature 5).
 *
 * Rules enforced server-side:
 *  - Only users who actually ordered the sandwich can rate it.
 *  - One rating per (user, sandwich).
 *  - Denormalized averageRating / totalRatings on CustomSandwich are recomputed
 *    inside the same transaction so the marketplace stays consistent.
 */

/**
 * Returns ordered community sandwiches with the user's existing rating (if any),
 * so the orders page can support create/edit/delete in one place.
 */
export async function getRateableForUser(userId: string) {
  const orders = await prisma.order.findMany({
    where: {
      userId,
      status: { not: "CANCELLED" },
      items: { some: { customSandwichId: { not: null } } },
    },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  const existing = await prisma.sandwichRating.findMany({
    where: { userId },
    select: { sandwichId: true, rating: true, review: true },
  });
  const existingBySandwich = new Map(existing.map((r) => [r.sandwichId, r]));

  const out: {
    orderId: string;
    orderNumber: number;
    sandwichId: string;
    name: string;
    date: string;
    currentRating: number | null;
    currentReview: string | null;
  }[] = [];
  const seen = new Set<string>();

  for (const o of orders) {
    for (const it of o.items) {
      if (!it.customSandwichId) continue;
      if (seen.has(it.customSandwichId)) continue;
      seen.add(it.customSandwichId);
      const current = existingBySandwich.get(it.customSandwichId);
      out.push({
        orderId: o.id,
        orderNumber: o.number,
        sandwichId: it.customSandwichId,
        name: it.name,
        date: o.createdAt.toISOString(),
        currentRating: current?.rating ?? null,
        currentReview: current?.review ?? null,
      });
    }
  }
  return out;
}

/** Verify the user ordered this sandwich in this order. */
async function assertPurchased(
  userId: string,
  orderId: string,
  sandwichId: string,
) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true },
  });
  if (!order) return false;
  return order.items.some((it) => it.customSandwichId === sandwichId);
}

export type RateInput = {
  userId: string;
  sandwichId: string;
  orderId: string;
  rating: number;
  review?: string | null;
};

export async function rateCustomSandwich(
  input: RateInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (input.rating < 1 || input.rating > 5) {
    return { ok: false, error: "امتیاز باید بین ۱ تا ۵ باشد." };
  }

  const purchased = await assertPurchased(
    input.userId,
    input.orderId,
    input.sandwichId,
  );
  if (!purchased) {
    return { ok: false, error: "فقط خریداران می‌توانند امتیاز دهند." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.sandwichRating.upsert({
        where: {
          userId_sandwichId: {
            userId: input.userId,
            sandwichId: input.sandwichId,
          },
        },
        create: {
          userId: input.userId,
          orderId: input.orderId,
          sandwichId: input.sandwichId,
          rating: input.rating,
          review: input.review ?? null,
        },
        update: {
          orderId: input.orderId,
          rating: input.rating,
          review: input.review ?? null,
        },
      });

      // Recompute aggregates from the source of truth.
      const agg = await tx.sandwichRating.aggregate({
        where: { sandwichId: input.sandwichId },
        _avg: { rating: true },
        _count: { rating: true },
      });
      await tx.customSandwich.update({
        where: { id: input.sandwichId },
        data: {
          averageRating: agg._avg.rating ?? 0,
          totalRatings: agg._count.rating,
        },
      });
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "ثبت امتیاز با خطا مواجه شد." };
  }
}

export async function deleteCustomSandwichRating(
  userId: string,
  sandwichId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.sandwichRating.delete({
        where: {
          userId_sandwichId: {
            userId,
            sandwichId,
          },
        },
      });

      const agg = await tx.sandwichRating.aggregate({
        where: { sandwichId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await tx.customSandwich.update({
        where: { id: sandwichId },
        data: {
          averageRating: agg._avg.rating ?? 0,
          totalRatings: agg._count.rating,
        },
      });
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "حذف امتیاز با خطا مواجه شد." };
  }
}

/** Public reviews for a community sandwich detail view. */
export async function getSandwichReviews(sandwichId: string) {
  return prisma.sandwichRating.findMany({
    where: { sandwichId, review: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { user: { select: { name: true } } },
  });
}
