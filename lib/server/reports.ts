import "server-only";
import { prisma } from "@/lib/db";

/** Reporting engine with flexible date ranges (feature: reports). */

export type RangeKey = "today" | "week" | "month" | "year" | "custom";

export function resolveRange(
  range: RangeKey,
  fromStr?: string,
  toStr?: string,
): { from: Date; to: Date } {
  const to = toStr ? new Date(toStr) : new Date();
  let from = new Date();
  switch (range) {
    case "today":
      from = new Date();
      from.setHours(0, 0, 0, 0);
      break;
    case "week":
      from = new Date(Date.now() - 7 * 86_400_000);
      break;
    case "month":
      from = new Date(Date.now() - 30 * 86_400_000);
      break;
    case "year":
      from = new Date(Date.now() - 365 * 86_400_000);
      break;
    case "custom":
      from = fromStr
        ? new Date(fromStr)
        : new Date(Date.now() - 30 * 86_400_000);
      break;
  }
  return { from, to };
}

export async function getSalesReport(from: Date, to: Date) {
  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: from, lte: to } },
    orderBy: { createdAt: "asc" },
    include: { items: true },
  });

  const totalOrders = orders.length;
  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const itemsSold = orders.reduce(
    (s, o) => s + o.items.reduce((s2, it) => s2 + it.qty, 0),
    0,
  );
  const avgOrderValue = totalOrders ? Math.round(revenue / totalOrders) : 0;

  // Daily revenue series.
  const daily = new Map<string, { revenue: number; orders: number }>();
  for (const o of orders) {
    const key = o.createdAt.toISOString().slice(0, 10);
    const cur = daily.get(key) ?? { revenue: 0, orders: 0 };
    cur.revenue += o.total;
    cur.orders += 1;
    daily.set(key, cur);
  }

  // Sandwich performance.
  const perSandwich = new Map<string, { qty: number; revenue: number }>();
  for (const o of orders) {
    for (const it of o.items) {
      const cur = perSandwich.get(it.name) ?? { qty: 0, revenue: 0 };
      cur.qty += it.qty;
      cur.revenue += it.lineTotal;
      perSandwich.set(it.name, cur);
    }
  }

  // Ingredient consumption.
  const ingredients = new Map<string, number>();
  for (const o of orders) {
    for (const it of o.items) {
      for (const n of it.toppingNames) {
        ingredients.set(n, (ingredients.get(n) ?? 0) + it.qty);
      }
    }
  }

  return {
    totalOrders,
    revenue,
    itemsSold,
    avgOrderValue,
    daily: Array.from(daily.entries()).map(([date, v]) => ({ date, ...v })),
    sandwiches: Array.from(perSandwich.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.qty - a.qty),
    ingredients: Array.from(ingredients.entries())
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty),
  };
}

export async function getGrowthReport(from: Date, to: Date) {
  const [newCustomers, referrals, discountUses] = await Promise.all([
    prisma.user.count({
      where: { role: "CUSTOMER", createdAt: { gte: from, lte: to } },
    }),
    prisma.referral.count({
      where: { registrationDate: { gte: from, lte: to } },
    }),
    prisma.discountRedemption.count({
      where: { createdAt: { gte: from, lte: to } },
    }),
  ]);
  return { newCustomers, referrals, discountUses };
}

/** Build a CSV string from rows (for export). */
export function toCSV(headers: string[], rows: (string | number)[][]): string {
  const escape = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.map(escape).join(",")];
  for (const r of rows) lines.push(r.map(escape).join(","));
  // BOM so Excel reads UTF-8 (Persian) correctly.
  return "\uFEFF" + lines.join("\n");
}
