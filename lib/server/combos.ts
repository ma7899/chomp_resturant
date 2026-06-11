import "server-only";
import { prisma } from "@/lib/db";

/** Combos admin repository (feature: combo / meal-deal management). */

export async function listCombos() {
  return prisma.combo.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: { sandwich: { select: { name: true, basePrice: true } } },
      },
    },
  });
}

export type ComboItemInput = { sandwichId: string; quantity: number };
export type ComboInput = {
  name: string;
  description?: string | null;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  image?: string | null;
  isActive: boolean;
  items: ComboItemInput[];
};

export async function createCombo(data: ComboInput) {
  const { items, ...combo } = data;
  return prisma.combo.create({
    data: { ...combo, items: { create: items } },
  });
}

export async function updateCombo(id: string, data: ComboInput) {
  const { items, ...combo } = data;
  return prisma.$transaction(async (tx) => {
    await tx.comboItem.deleteMany({ where: { comboId: id } });
    return tx.combo.update({
      where: { id },
      data: { ...combo, items: { create: items } },
    });
  });
}

export async function deleteCombo(id: string) {
  await prisma.combo.delete({ where: { id } });
}

/**
 * AI-style combo suggestions from order history (feature 14):
 * finds pairs of menu sandwiches frequently bought together.
 */
export async function suggestCombos(limit = 5) {
  const orders = await prisma.order.findMany({
    select: { items: { select: { sandwichSlug: true, name: true } } },
    take: 500,
    orderBy: { createdAt: "desc" },
  });

  const pairCounts = new Map<
    string,
    { names: [string, string]; count: number }
  >();
  for (const o of orders) {
    const slugs = Array.from(
      new Map(
        o.items
          .filter((i) => i.sandwichSlug)
          .map((i) => [i.sandwichSlug as string, i.name]),
      ).entries(),
    );
    for (let i = 0; i < slugs.length; i++) {
      for (let j = i + 1; j < slugs.length; j++) {
        const [a, b] = [slugs[i], slugs[j]].sort((x, y) =>
          x[0].localeCompare(y[0]),
        );
        const key = `${a[0]}+${b[0]}`;
        const cur = pairCounts.get(key) ?? {
          names: [a[1], b[1]] as [string, string],
          count: 0,
        };
        cur.count++;
        pairCounts.set(key, cur);
      }
    }
  }

  return Array.from(pairCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
