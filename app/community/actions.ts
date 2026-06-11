"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { saveCustomSandwich } from "@/lib/server/customSandwiches";
import { rateCustomSandwich } from "@/lib/server/ratings";
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

  const { sandwich, deduped } = await saveCustomSandwich({
    creatorId: user.id,
    name: d.name,
    description: d.description ?? null,
    baseSlug: d.baseSlug ?? null,
    basePrice: d.basePrice,
    isPublic: d.isPublic,
    ingredientIds: d.ingredientIds,
  });

  revalidatePath("/dashboard/saved");
  if (d.isPublic) revalidatePath("/community");
  return { ok: true, id: sandwich.id, deduped };
}

export type RateResult = { ok: true } | { ok: false; error: string };

export async function rateSandwichAction(raw: unknown): Promise<RateResult> {
  const user = await requireUser();
  const parsed = rateSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "ورودی نامعتبر است." };

  const result = await rateCustomSandwich({
    userId: user.id,
    sandwichId: parsed.data.sandwichId,
    orderId: parsed.data.orderId,
    rating: parsed.data.rating,
    review: parsed.data.review ?? null,
  });

  if (result.ok) {
    revalidatePath("/community");
    revalidatePath("/dashboard/orders");
  }
  return result;
}
