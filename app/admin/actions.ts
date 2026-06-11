"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import {
  createDiscount,
  updateDiscount,
  deleteDiscount,
  type DiscountInput,
} from "@/lib/server/discounts";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/server/categories";
import {
  createCombo,
  updateCombo,
  deleteCombo,
  type ComboInput,
} from "@/lib/server/combos";
import {
  assignDiscountToCustomer,
  removeDiscountFromCustomer,
} from "@/lib/server/customers";
import {
  discountSchema,
  categorySchema,
  comboSchema,
} from "@/lib/validation/admin";

type Result = { ok: true } | { ok: false; error: string };

/* ───────── Discounts ───────── */

function toDiscountInput(
  d: ReturnType<typeof discountSchema.parse>,
): DiscountInput {
  return {
    code: d.code,
    type: d.type,
    percentage: d.type === "PERCENTAGE" ? (d.percentage ?? null) : null,
    fixedAmount: d.type === "FIXED" ? (d.fixedAmount ?? null) : null,
    minPurchase: d.minPurchase ?? null,
    maxDiscount: d.maxDiscount ?? null,
    startDate: d.startDate ? new Date(d.startDate) : null,
    endDate: d.endDate ? new Date(d.endDate) : null,
    usageLimit: d.usageLimit ?? null,
    usagePerUser: d.usagePerUser ?? null,
    isActive: d.isActive,
  };
}

export async function saveDiscountAction(
  id: string | null,
  raw: unknown,
): Promise<Result> {
  await requireAdmin();
  const parsed = discountSchema.safeParse(raw);
  if (!parsed.success)
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر",
    };
  try {
    const data = toDiscountInput(parsed.data);
    if (id) await updateDiscount(id, data);
    else await createDiscount(data);
  } catch {
    return { ok: false, error: "کد تخفیف تکراری است یا خطایی رخ داد." };
  }
  revalidatePath("/admin/discounts");
  return { ok: true };
}

export async function deleteDiscountAction(id: string): Promise<Result> {
  await requireAdmin();
  await deleteDiscount(id);
  revalidatePath("/admin/discounts");
  return { ok: true };
}

/* ───────── Categories ───────── */

export async function saveCategoryAction(
  id: string | null,
  raw: unknown,
): Promise<Result> {
  await requireAdmin();
  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success)
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر",
    };
  try {
    if (id) await updateCategory(id, parsed.data);
    else await createCategory(parsed.data);
  } catch {
    return { ok: false, error: "نامک تکراری است یا خطایی رخ داد." };
  }
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function deleteCategoryAction(id: string): Promise<Result> {
  await requireAdmin();
  await deleteCategory(id);
  revalidatePath("/admin/categories");
  return { ok: true };
}

/* ───────── Combos ───────── */

export async function saveComboAction(
  id: string | null,
  raw: unknown,
): Promise<Result> {
  await requireAdmin();
  const parsed = comboSchema.safeParse(raw);
  if (!parsed.success)
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر",
    };
  const data: ComboInput = {
    name: parsed.data.name,
    description: parsed.data.description ?? null,
    discountType: parsed.data.discountType,
    discountValue: parsed.data.discountValue,
    image: parsed.data.image ?? null,
    isActive: parsed.data.isActive,
    items: parsed.data.items,
  };
  if (id) await updateCombo(id, data);
  else await createCombo(data);
  revalidatePath("/admin/combos");
  return { ok: true };
}

export async function deleteComboAction(id: string): Promise<Result> {
  await requireAdmin();
  await deleteCombo(id);
  revalidatePath("/admin/combos");
  return { ok: true };
}

/* ───────── Customer discounts ───────── */

export async function assignCustomerDiscountAction(
  customerId: string,
  discountId: string,
): Promise<Result> {
  await requireAdmin();
  await assignDiscountToCustomer(customerId, discountId);
  revalidatePath(`/admin/customers/${customerId}`);
  return { ok: true };
}

export async function removeCustomerDiscountAction(
  customerId: string,
  discountId: string,
): Promise<Result> {
  await requireAdmin();
  await removeDiscountFromCustomer(customerId, discountId);
  revalidatePath(`/admin/customers/${customerId}`);
  return { ok: true };
}
