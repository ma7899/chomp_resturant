"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { saveCustomSandwich } from "@/lib/server/customSandwiches";
import {
  deleteCustomSandwichRating,
  rateCustomSandwich,
  rateSandwich,
  deleteSandwichRating,
} from "@/lib/server/ratings";
import { saveCustomSchema, rateSchema } from "@/lib/validation/sandwich";

/**
 * Server actions for custom sandwiches + ratings (features 2, 5, 7, 10).
 * All actions re-derive the user from the session.
 */

export type SaveCustomResult =
  | { ok: true; id: string; deduped: boolean }
  | { ok: false; error: string };

export async function saveCustomSandwichAction(
  raw: unknown,
): Promise<SaveCustomResult> {
  const user = await requireUser();
  const parsed = saveCustomSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "اطلاعات ساندویچ نامعتبر است." };
  }
  const d = parsed.data;

  let sandwich: { id: string };
  let deduped: boolean;
  try {
    const result = await saveCustomSandwich({
      creatorId: user.id,
      name: d.name,
      description: d.description ?? null,
      baseSlug: d.baseSlug ?? null,
      basePrice: d.basePrice,
      isPublic: d.isPublic,
      ingredientIds: d.ingredientIds,
    });
    sandwich = result.sandwich;
    deduped = result.deduped;
  } catch (e) {
    if (e instanceof Error && e.message === "ORDER_REQUIRED_FOR_PUBLIC") {
      return {
        ok: false,
        error:
          "برای انتشار در مارکت، باید همین ساندویچ را قبلاً سفارش داده باشید.",
      };
    }
    if (e instanceof Error && e.message === "RECIPE_EXISTS_IN_MENU") {
      return {
        ok: false,
        error:
          "ترکیب مواد این ساندویچ قبلاً در منوی اصلی وجود دارد و قابل انتشار نیست.",
      };
    }
    if (e instanceof Error && e.message === "RECIPE_EXISTS_IN_MARKET") {
      return {
        ok: false,
        error: "ترکیب مواد این ساندویچ قبلاً در مارکت عمومی ثبت شده است.",
      };
    }
    return { ok: false, error: "ذخیره ساندویچ با خطا مواجه شد." };
  }

  revalidatePath("/dashboard/saved");
  if (d.isPublic) revalidatePath("/community");
  return { ok: true, id: sandwich.id, deduped };
}

export type RateResult = { ok: true } | { ok: false; error: string };

export async function rateSandwichAction(raw: unknown): Promise<RateResult> {
  const user = await requireUser();
  const parsed = rateSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "ورودی نامعتبر است." };

  const customSandwichId =
    parsed.data.customSandwichId || parsed.data.sandwichId;
  const menuSandwichSlug = parsed.data.menuSandwichSlug;

  const result = await rateSandwich({
    userId: user.id,
    customSandwichId: customSandwichId || undefined,
    menuSandwichSlug: menuSandwichSlug || undefined,
    orderId: parsed.data.orderId,
    rating: parsed.data.rating,
    review: parsed.data.review ?? null,
  });

  if (result.ok) {
    revalidatePath("/community");
    if (customSandwichId) revalidatePath(`/community/${customSandwichId}`);
    revalidatePath("/dashboard/orders");
  }
  return result;
}

export async function deleteSandwichRatingAction(
  raw: unknown,
): Promise<RateResult> {
  const user = await requireUser();

  // Parse the input - could be a string (sandwichId) or object with orderId/sandwich info
  let customSandwichId: string | undefined;
  let menuSandwichSlug: string | undefined;
  let orderId: string | undefined;

  if (typeof raw === "string") {
    // Legacy: just sandwichId
    customSandwichId = raw;
  } else if (typeof raw === "object" && raw !== null) {
    const obj = raw as Record<string, unknown>;
    customSandwichId = obj.customSandwichId as string | undefined;
    menuSandwichSlug = obj.menuSandwichSlug as string | undefined;
    orderId = obj.orderId as string | undefined;
  }

  if (!customSandwichId && !menuSandwichSlug) {
    return { ok: false, error: "ورودی نامعتبر است." };
  }

  if (!orderId) {
    return { ok: false, error: "شناسه سفارش ضروری است." };
  }

  const result = await deleteSandwichRating(
    user.id,
    orderId,
    customSandwichId,
    menuSandwichSlug,
  );

  if (result.ok) {
    revalidatePath("/community");
    if (customSandwichId) revalidatePath(`/community/${customSandwichId}`);
    revalidatePath("/dashboard/orders");
  }
  return result;
}
