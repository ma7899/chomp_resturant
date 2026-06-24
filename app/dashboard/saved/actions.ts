"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import {
  deleteUserCustomSandwich,
  publishUserCustomSandwich,
} from "@/lib/server/customSandwiches";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function deleteSavedSandwichAction(
  sandwichId: string,
): Promise<ActionResult> {
  const user = await requireUser();
  if (!sandwichId) return { ok: false, error: "ورودی نامعتبر است." };

  try {
    await deleteUserCustomSandwich(user.id, sandwichId);
  } catch {
    return { ok: false, error: "ساندویچ یافت نشد." };
  }

  revalidatePath("/dashboard/saved");
  revalidatePath("/community");
  return { ok: true };
}

export async function publishSavedSandwichAction(
  sandwichId: string,
): Promise<ActionResult> {
  const user = await requireUser();
  if (!sandwichId) return { ok: false, error: "ورودی نامعتبر است." };

  try {
    await publishUserCustomSandwich(user.id, sandwichId);
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === "CUSTOM_NOT_FOUND") {
        return { ok: false, error: "ساندویچ یافت نشد." };
      }
      if (e.message === "ORDER_REQUIRED_FOR_PUBLIC") {
        return {
          ok: false,
          error:
            "برای انتشار در مارکت، باید همین ساندویچ را قبلاً سفارش داده باشید.",
        };
      }
      if (e.message === "RECIPE_EXISTS_IN_MENU") {
        return {
          ok: false,
          error:
            "ترکیب مواد این ساندویچ قبلاً در منوی اصلی وجود دارد و قابل انتشار نیست.",
        };
      }
      if (e.message === "RECIPE_EXISTS_IN_MARKET") {
        return {
          ok: false,
          error: "ترکیب مواد این ساندویچ قبلاً در مارکت عمومی ثبت شده است.",
        };
      }
    }
    return { ok: false, error: "عمومی‌سازی ساندویچ با خطا مواجه شد." };
  }

  revalidatePath("/dashboard/saved");
  revalidatePath("/community");
  return { ok: true };
}
