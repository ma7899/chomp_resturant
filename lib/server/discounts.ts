import "server-only";
import { prisma } from "@/lib/db";
import type { DiscountType } from "@prisma/client";

/** Discounts admin repository (feature: discount management). */

export async function listDiscounts() {
  return prisma.discount.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { redemptions: true } } },
  });
}

export async function getDiscount(id: string) {
  return prisma.discount.findUnique({ where: { id } });
}

export type DiscountInput = {
  code: string;
  type: DiscountType;
  percentage?: number | null;
  fixedAmount?: number | null;
  minPurchase?: number | null;
  maxDiscount?: number | null;
  startDate?: Date | null;
  endDate?: Date | null;
  usageLimit?: number | null;
  usagePerUser?: number | null;
  isActive: boolean;
};

export async function createDiscount(data: DiscountInput) {
  return prisma.discount.create({
    data: { ...data, code: data.code.toUpperCase() },
  });
}

export async function updateDiscount(id: string, data: DiscountInput) {
  return prisma.discount.update({
    where: { id },
    data: { ...data, code: data.code.toUpperCase() },
  });
}

export async function deleteDiscount(id: string) {
  await prisma.discount.delete({ where: { id } });
}

/**
 * Evaluate a discount code for a user + cart subtotal.
 * Enforces active window, min purchase, usage caps (Phase 17).
 */
export async function evaluateDiscount(
  code: string,
  userId: string | null,
  subtotal: number,
): Promise<
  | { ok: true; discountId: string; amount: number }
  | { ok: false; error: string }
> {
  const d = await prisma.discount.findUnique({
    where: { code: code.toUpperCase() },
  });
  if (!d || !d.isActive) return { ok: false, error: "کد تخفیف نامعتبر است." };

  const now = new Date();
  if (d.startDate && d.startDate > now)
    return { ok: false, error: "کد تخفیف هنوز فعال نشده است." };
  if (d.endDate && d.endDate < now)
    return { ok: false, error: "کد تخفیف منقضی شده است." };
  if (d.minPurchase && subtotal < d.minPurchase)
    return {
      ok: false,
      error: `حداقل مبلغ خرید ${d.minPurchase.toLocaleString("fa-IR")} تومان است.`,
    };

  if (d.usageLimit != null) {
    const used = await prisma.discountRedemption.count({
      where: { discountId: d.id },
    });
    if (used >= d.usageLimit)
      return { ok: false, error: "ظرفیت استفاده از این کد تمام شده است." };
  }
  if (d.usagePerUser != null && userId) {
    const usedByUser = await prisma.discountRedemption.count({
      where: { discountId: d.id, userId },
    });
    if (usedByUser >= d.usagePerUser)
      return { ok: false, error: "سقف استفاده شما از این کد پر شده است." };
  }

  let amount = 0;
  if (d.type === "PERCENTAGE" && d.percentage) {
    amount = Math.floor((subtotal * d.percentage) / 100);
    if (d.maxDiscount) amount = Math.min(amount, d.maxDiscount);
  } else if (d.type === "FIXED" && d.fixedAmount) {
    amount = d.fixedAmount;
  }
  amount = Math.min(amount, subtotal);

  return { ok: true, discountId: d.id, amount };
}
