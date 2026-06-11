import "server-only";
import { prisma } from "@/lib/db";

/** Customers admin repository + analytics (feature: customer management). */

export async function listCustomers(search?: string) {
  return prisma.user.findMany({
    where: {
      role: "CUSTOMER",
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { phone: { contains: search } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      _count: { select: { orders: true, invitees: true } },
    },
  });
}

export async function getCustomerProfile(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      addresses: true,
      customerDiscounts: { include: { discount: true } },
      _count: { select: { invitees: true, orders: true } },
    },
  });
}

export async function getCustomerOrders(id: string) {
  return prisma.order.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
}

/**
 * Deep analytics for a single customer (feature: customer analytics):
 *  - total spend, average order value
 *  - favorite items / ingredients
 *  - purchase heatmap by hour-of-day and day-of-week
 *  - re-engagement + discount suggestion heuristics
 */
export async function getCustomerAnalytics(id: string) {
  const orders = await prisma.order.findMany({
    where: { userId: id },
    orderBy: { createdAt: "asc" },
    include: { items: true },
  });

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((s, o) => s + o.total, 0);
  const avgOrderValue = totalOrders ? Math.round(totalSpent / totalOrders) : 0;

  // Favorite sandwiches by quantity.
  const itemCounts = new Map<string, number>();
  const ingredientCounts = new Map<string, number>();
  for (const o of orders) {
    for (const it of o.items) {
      itemCounts.set(it.name, (itemCounts.get(it.name) ?? 0) + it.qty);
      for (const n of it.toppingNames) {
        ingredientCounts.set(n, (ingredientCounts.get(n) ?? 0) + it.qty);
      }
    }
  }
  const topItems = topN(itemCounts, 5);
  const topIngredients = topN(ingredientCounts, 8);

  // Heatmaps.
  const byHour = new Array(24).fill(0) as number[];
  const byWeekday = new Array(7).fill(0) as number[]; // 0=Sunday
  const byMonth = new Map<string, number>();
  for (const o of orders) {
    const d = o.createdAt;
    byHour[d.getHours()]++;
    byWeekday[d.getDay()]++;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    byMonth.set(key, (byMonth.get(key) ?? 0) + 1);
  }

  const lastOrder = orders.length ? orders[orders.length - 1].createdAt : null;
  const daysSinceLast = lastOrder
    ? Math.floor((Date.now() - lastOrder.getTime()) / 86_400_000)
    : null;

  // Heuristic recommendations for the admin.
  const recommendations: string[] = [];
  if (daysSinceLast != null && daysSinceLast > 30) {
    recommendations.push(
      `این مشتری ${daysSinceLast} روز است خرید نکرده — کد بازگشت ۲۰٪ پیشنهاد می‌شود.`,
    );
  }
  if (avgOrderValue > 0 && totalOrders >= 5) {
    recommendations.push(
      "مشتری وفادار است — می‌توانید تخفیف اختصاصی یا کمبو ویژه فعال کنید.",
    );
  }
  if (totalOrders === 1) {
    recommendations.push(
      "فقط یک‌بار خرید کرده — کد خرید دوم برای تبدیل به مشتری دائمی مؤثر است.",
    );
  }

  return {
    totalOrders,
    totalSpent,
    avgOrderValue,
    topItems,
    topIngredients,
    byHour,
    byWeekday,
    byMonth: Array.from(byMonth.entries()).map(([month, count]) => ({
      month,
      count,
    })),
    daysSinceLast,
    recommendations,
  };
}

/** Assign / remove a personal discount for a customer. */
export async function assignDiscountToCustomer(
  customerId: string,
  discountId: string,
) {
  return prisma.customerDiscount.upsert({
    where: { customerId_discountId: { customerId, discountId } },
    update: {},
    create: { customerId, discountId },
  });
}

export async function removeDiscountFromCustomer(
  customerId: string,
  discountId: string,
) {
  await prisma.customerDiscount.deleteMany({
    where: { customerId, discountId },
  });
}

function topN(map: Map<string, number>, n: number) {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([name, count]) => ({ name, count }));
}
