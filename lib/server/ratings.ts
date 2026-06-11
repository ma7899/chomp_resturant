import "server-only";
import { prisma } from "@/lib/db";

/**
 * Rating system (Phase 8 / feature 5).
 *
 * Rules enforced server-side:
 *  - Only users who actually ordered the sandwich can rate it.
 *  - One rating per (user, order, sandwich) — DB unique constraint blocks dupes.
 *  - Denormalized averageRating / totalRatings on CustomSandwich are recomputed
 *    inside the same transaction so the marketplace stays consistent.
 */

/**
 * Returns custom sandwiches the user has ordered that they have NOT yet rated,
 * paired with the order they can rate against. Drives the "rate your order" UI.
 */
export async function getRateableForUser(userId: string) {
  // Orders by the user that reference a custom sandwich line.
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  const existing = await prisma.sandwichRating.findMany({
    where: { userId },
    select: { orderId: true, sandwichId: true },
  });
  const rated = new Set(existing.map((r) => `${r.orderId}:${r.sandwichId}`));

  const out: {
    orderId: string;
    orderNumber: number;
    sandwichId: string;
    name: string;
    date: string;
  }[] = [];

  for (const o of orders) {
    for (const it of o.items) {
      if (!it.customSandwichId) continue;
      const key = `${o.id}:${it.customSandwichId}`;
      if (rated.has(key)) continue;
      out.push({
        orderId: o.id,
        orderNumber: o.number,
        sandwichId: it.customSandwichId,
        name: it.name,
        date: o.createdAt.toISOString(),
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

export async function rateCustomSandwich(input: RateInput): Promise<
  { ok: true } | { ok: false; error: string }
> {
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
      await tx.sandwichRating.create({
        data: {
          userId: input.userId,
          orderId: input.orderId,
          sandwichId: input.sandwichId,
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
  } catch (e) {
    // Unique constraint → already rated.
    if (
      typeof e === "object" &&
      e !== null &&
      "code" in e &&
      (e as { code?: string }).code === "P2002"
    ) {
      return { ok: false, error: "قبلاً به این سفارش امتیاز داده‌اید." };
    }
    return { ok: false, error: "ثبت امتیاز با خطا مواجه شد." };
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
