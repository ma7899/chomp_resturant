import "server-only";
import { prisma } from "@/lib/db";

/**
 * Rating system (Phase 8 / feature 5).
 *
 * Rules enforced server-side:
 *  - Only users who actually ordered the sandwich can rate it.
 *  - One rating per (user, sandwich, order).
 *  - Same sandwich in different orders can be rated separately.
 *  - Denormalized averageRating / totalRatings on CustomSandwich are recomputed
 *    inside the same transaction so the marketplace stays consistent.
 */

/**
 * Returns rateable sandwiches from all orders (both menu and custom),
 * with the user's existing rating for each sandwich in that specific order.
 */
export async function getRateableForUser(userId: string) {
  const orders = await prisma.order.findMany({
    where: {
      userId,
      status: "DELIVERED",
    },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  // Get all existing ratings for this user (keyed by order + sandwich)
  const existing = await prisma.sandwichRating.findMany({
    where: { userId },
    select: {
      orderId: true,
      customSandwichId: true,
      menuSandwichSlug: true,
      rating: true,
      review: true,
    },
  });

  const out: {
    orderId: string;
    orderNumber: number;
    sandwichType: "menu" | "custom";
    sandwichSlug?: string;
    customSandwichId?: string;
    name: string;
    date: string;
    currentRating: number | null;
    currentReview: string | null;
  }[] = [];

  for (const o of orders) {
    for (const it of o.items) {
      // Find the corresponding rating for this item in this order
      const current = existing.find(
        (r) =>
          r.orderId === o.id &&
          ((it.customSandwichId &&
            r.customSandwichId === it.customSandwichId) ||
            (it.sandwichSlug && r.menuSandwichSlug === it.sandwichSlug)),
      );

      if (it.customSandwichId) {
        out.push({
          orderId: o.id,
          orderNumber: o.number,
          sandwichType: "custom",
          customSandwichId: it.customSandwichId,
          name: it.name,
          date: o.createdAt.toISOString(),
          currentRating: current?.rating ?? null,
          currentReview: current?.review ?? null,
        });
      } else if (it.sandwichSlug) {
        out.push({
          orderId: o.id,
          orderNumber: o.number,
          sandwichType: "menu",
          sandwichSlug: it.sandwichSlug,
          name: it.name,
          date: o.createdAt.toISOString(),
          currentRating: current?.rating ?? null,
          currentReview: current?.review ?? null,
        });
      }
    }
  }
  return out;
}

/** Verify the user ordered this sandwich in this order. */
async function assertPurchased(
  userId: string,
  orderId: string,
  customSandwichId?: string,
  menuSandwichSlug?: string,
) {
  if (!customSandwichId && !menuSandwichSlug) return false;

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true },
  });
  if (!order) return false;

  if (customSandwichId) {
    return order.items.some((it) => it.customSandwichId === customSandwichId);
  } else {
    return order.items.some((it) => it.sandwichSlug === menuSandwichSlug);
  }
}

export type RateInput = {
  userId: string;
  customSandwichId?: string;
  menuSandwichSlug?: string;
  orderId: string;
  rating: number;
  review?: string | null;
};

export async function rateSandwich(
  input: RateInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (input.rating < 1 || input.rating > 5) {
    return { ok: false, error: "امتیاز باید بین ۱ تا ۵ باشد." };
  }

  if (!input.customSandwichId && !input.menuSandwichSlug) {
    return { ok: false, error: "نوع ساندویچ نامشخص است." };
  }

  if (input.customSandwichId && input.menuSandwichSlug) {
    return { ok: false, error: "نوع ساندویچ نامعتبر است." };
  }

  const purchased = await assertPurchased(
    input.userId,
    input.orderId,
    input.customSandwichId,
    input.menuSandwichSlug,
  );
  if (!purchased) {
    return { ok: false, error: "فقط خریداران می‌توانند امتیاز دهند." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.sandwichRating.findFirst({
        where: {
          userId: input.userId,
          orderId: input.orderId,
          customSandwichId: input.customSandwichId ?? null,
          menuSandwichSlug: input.menuSandwichSlug ?? null,
        },
        select: { id: true },
      });

      if (existing) {
        await tx.sandwichRating.update({
          where: { id: existing.id },
          data: {
            rating: input.rating,
            review: input.review ?? null,
          },
        });
      } else {
        await tx.sandwichRating.create({
          data: {
            userId: input.userId,
            orderId: input.orderId,
            customSandwichId: input.customSandwichId ?? null,
            menuSandwichSlug: input.menuSandwichSlug ?? null,
            rating: input.rating,
            review: input.review ?? null,
          },
        });
      }

      // Only recompute aggregates for custom sandwiches
      if (input.customSandwichId) {
        const agg = await tx.sandwichRating.aggregate({
          where: { customSandwichId: input.customSandwichId },
          _avg: { rating: true },
          _count: { rating: true },
        });
        await tx.customSandwich.update({
          where: { id: input.customSandwichId },
          data: {
            averageRating: agg._avg.rating ?? 0,
            totalRatings: agg._count.rating,
          },
        });
      }
    });
    return { ok: true };
  } catch (e) {
    console.error("Rating error:", e);
    return { ok: false, error: "ثبت امتیاز با خطا مواجه شد." };
  }
}

export async function deleteSandwichRating(
  userId: string,
  orderId: string,
  customSandwichId?: string,
  menuSandwichSlug?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!customSandwichId && !menuSandwichSlug) {
    return { ok: false, error: "نوع ساندویچ نامشخص است." };
  }

  if (customSandwichId && menuSandwichSlug) {
    return { ok: false, error: "نوع ساندویچ نامعتبر است." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.sandwichRating.findFirst({
        where: {
          userId,
          orderId,
          customSandwichId: customSandwichId ?? null,
          menuSandwichSlug: menuSandwichSlug ?? null,
        },
        select: { id: true },
      });

      if (!existing) {
        throw new Error("RATING_NOT_FOUND");
      }

      await tx.sandwichRating.delete({ where: { id: existing.id } });

      // Only recompute aggregates for custom sandwiches
      if (customSandwichId) {
        const agg = await tx.sandwichRating.aggregate({
          where: { customSandwichId },
          _avg: { rating: true },
          _count: { rating: true },
        });

        await tx.customSandwich.update({
          where: { id: customSandwichId },
          data: {
            averageRating: agg._avg.rating ?? 0,
            totalRatings: agg._count.rating,
          },
        });
      }
    });
    return { ok: true };
  } catch (e) {
    if (e instanceof Error && e.message === "RATING_NOT_FOUND") {
      return { ok: false, error: "امتیازی برای حذف یافت نشد." };
    }
    console.error("Delete rating error:", e);
    return { ok: false, error: "حذف امتیاز با خطا مواجه شد." };
  }
}

// Keep old function names for backwards compatibility
export const rateCustomSandwich = rateSandwich;
export const deleteCustomSandwichRating = (
  userId: string,
  customSandwichId: string,
) => deleteSandwichRating(userId, "", customSandwichId, undefined);

/** Public reviews for a community sandwich detail view. */
export async function getSandwichReviews(customSandwichId: string) {
  return prisma.sandwichRating.findMany({
    where: { customSandwichId, review: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { user: { select: { name: true } } },
  });
}

/** Reviews and avg rating for a menu sandwich detail page. */
export async function getMenuSandwichReviews(slug: string) {
  const [rows, agg] = await Promise.all([
    prisma.sandwichRating.findMany({
      where: { menuSandwichSlug: slug, review: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { user: { select: { name: true } } },
    }),
    prisma.sandwichRating.aggregate({
      where: { menuSandwichSlug: slug },
      _avg: { rating: true },
      _count: { rating: true },
    }),
  ]);
  return {
    reviews: rows,
    averageRating: agg._avg.rating ?? 0,
    totalRatings: agg._count.rating,
  };
}
