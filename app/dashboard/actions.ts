"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import {
  createAddress,
  deleteAddress,
  setDefaultAddress,
  updateAddress,
  type AddressInput,
} from "@/lib/server/addresses";
import { setUserAllergies } from "@/lib/server/allergies";
import { addressSchema, allergySchema } from "@/lib/validation/account";

/**
 * Auth-guarded server actions for the customer dashboard.
 * Every action re-derives the user from the session — never trusts client ids.
 */

type ActionResult = { ok: true } | { ok: false; error: string };

function cleanAddress(raw: unknown): AddressInput | null {
  const parsed = addressSchema.safeParse(raw);
  if (!parsed.success) return null;
  const d = parsed.data;
  return {
    title: d.title,
    province: d.province,
    city: d.city,
    street: d.street,
    alley: d.alley || null,
    buildingNumber: d.buildingNumber || null,
    unit: d.unit || null,
    postalCode: d.postalCode || null,
    latitude: d.latitude ?? null,
    longitude: d.longitude ?? null,
    isDefault: d.isDefault ?? false,
  };
}

export async function createAddressAction(raw: unknown): Promise<ActionResult> {
  const user = await requireUser();
  const data = cleanAddress(raw);
  if (!data) return { ok: false, error: "اطلاعات آدرس نامعتبر است." };
  await createAddress(user.id, data);
  revalidatePath("/dashboard/addresses");
  return { ok: true };
}

export async function updateAddressAction(
  id: string,
  raw: unknown,
): Promise<ActionResult> {
  const user = await requireUser();
  const data = cleanAddress(raw);
  if (!data) return { ok: false, error: "اطلاعات آدرس نامعتبر است." };
  try {
    await updateAddress(user.id, id, data);
  } catch {
    return { ok: false, error: "آدرس یافت نشد." };
  }
  revalidatePath("/dashboard/addresses");
  return { ok: true };
}

export async function deleteAddressAction(id: string): Promise<ActionResult> {
  const user = await requireUser();
  try {
    await deleteAddress(user.id, id);
  } catch {
    return { ok: false, error: "آدرس یافت نشد." };
  }
  revalidatePath("/dashboard/addresses");
  return { ok: true };
}

export async function setDefaultAddressAction(
  id: string,
): Promise<ActionResult> {
  const user = await requireUser();
  try {
    await setDefaultAddress(user.id, id);
  } catch {
    return { ok: false, error: "آدرس یافت نشد." };
  }
  revalidatePath("/dashboard/addresses");
  return { ok: true };
}

export async function saveAllergiesAction(
  ingredientIds: string[],
): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = allergySchema.safeParse({ ingredientIds });
  if (!parsed.success) return { ok: false, error: "ورودی نامعتبر است." };
  await setUserAllergies(user.id, parsed.data.ingredientIds);
  revalidatePath("/dashboard/allergies");
  return { ok: true };
}
