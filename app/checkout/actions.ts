"use server";

import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { createOrder, type NewOrderItem } from "@/lib/server/orders";
import { incrementCustomOrders } from "@/lib/server/customSandwiches";

/**
 * Checkout order creation (Phase 4 + 17).
 *
 * Prices and totals are recomputed on the SERVER from the persisted catalog —
 * the client only sends which items + quantities it wants, never amounts.
 * Community / custom lines carry a verified custom sandwich id.
 */

const DELIVERY_FEE = 50;

const lineSchema = z.object({
  sandwichSlug: z.string().min(1),
  toppingIds: z.array(z.string()).max(60),
  qty: z.number().int().min(1).max(50),
  customSandwichId: z.string().optional().nullable(),
});

const checkoutSchema = z.object({
  items: z.array(lineSchema).min(1, "سبد خرید خالی است"),
  method: z.enum(["delivery", "pickup"]),
  name: z.string().min(2).max(80),
  phone: z.string().min(8).max(20),
  addressId: z.string().optional().nullable(),
  addressText: z.string().max(500).optional().nullable(),
  note: z.string().max(500).optional().nullable(),
  confirmAllergyWarning: z.boolean().optional(),
});

export type CheckoutResult =
  | { ok: true; orderNumber: number; orderId: string }
  | {
      ok: false;
      error: string;
      code?: "ALLERGY_CONFLICT" | "ADDRESS_REQUIRED";
      allergens?: string[];
    };

export async function placeOrderAction(raw: unknown): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "اطلاعات سفارش نامعتبر است." };
  }
  const input = parsed.data;
  const user = await getCurrentUser();

  // Load the catalog rows we need in batched queries (no N+1).
  const slugs = Array.from(
    new Set(
      input.items
        .filter((i) => !i.customSandwichId && i.sandwichSlug !== "custom")
        .map((i) => i.sandwichSlug),
    ),
  );
  const customIds = Array.from(
    new Set(
      input.items
        .map((i) => i.customSandwichId)
        .filter((x): x is string => !!x),
    ),
  );
  const toppingIds = Array.from(
    new Set(input.items.flatMap((i) => i.toppingIds)),
  );
  const [sandwiches, toppings, customs] = await Promise.all([
    slugs.length
      ? prisma.sandwich.findMany({ where: { slug: { in: slugs } } })
      : Promise.resolve([]),
    toppingIds.length
      ? prisma.ingredient.findMany({ where: { id: { in: toppingIds } } })
      : Promise.resolve([]),
    customIds.length
      ? prisma.customSandwich.findMany({ where: { id: { in: customIds } } })
      : Promise.resolve([]),
  ]);

  const sandwichBySlug = new Map(sandwiches.map((s) => [s.slug, s]));
  const toppingById = new Map(toppings.map((t) => [t.id, t]));
  const customById = new Map(customs.map((c) => [c.id, c]));

  // Build menu ingredient name -> id map so allergy checks can include menu
  // sandwiches (whose includedIngredients are stored as names).
  const ingredientNames = Array.from(
    new Set(sandwiches.flatMap((s) => s.includedIngredients)),
  );
  const namedIngredients = ingredientNames.length
    ? await prisma.ingredient.findMany({
        where: { name: { in: ingredientNames } },
        select: { id: true, name: true },
      })
    : [];
  const ingredientIdByName = new Map(
    namedIngredients.map((i) => [i.name, i.id]),
  );

  const orderItems: NewOrderItem[] = [];
  let subtotal = 0;
  const orderedCustomIds: string[] = [];
  const cartIngredientIds = new Set<string>();

  for (const line of input.items) {
    // ── Community / custom sandwich line ──
    if (line.customSandwichId) {
      const c = customById.get(line.customSandwichId);
      if (!c) return { ok: false, error: "ساندویچ سفارشی یافت نشد." };
      const unitPrice = c.basePrice;
      const lineTotal = unitPrice * line.qty;
      subtotal += lineTotal;
      orderedCustomIds.push(c.id);

      const lineToppings = line.toppingIds
        .map((id) => toppingById.get(id))
        .filter((t): t is NonNullable<typeof t> => !!t);
      lineToppings.forEach((t) => cartIngredientIds.add(t.id));

      const customIngredients = await prisma.customSandwichIngredient.findMany({
        where: { sandwichId: c.id },
        select: { ingredientId: true },
      });
      customIngredients.forEach((x) => cartIngredientIds.add(x.ingredientId));

      orderItems.push({
        sandwichSlug: c.baseSlug ?? null,
        customSandwichId: c.id,
        name: c.name,
        toppingIds: lineToppings.map((t) => t.id),
        toppingNames: lineToppings.map((t) => t.name),
        qty: line.qty,
        unitPrice,
        lineTotal,
      });
      continue;
    }

    // ── No-base custom line (builder with "No Base Sandwich") ──
    if (line.sandwichSlug === "custom") {
      const lineToppings = line.toppingIds
        .map((id) => toppingById.get(id))
        .filter((t): t is NonNullable<typeof t> => !!t);
      lineToppings.forEach((t) => cartIngredientIds.add(t.id));

      const unitPrice = lineToppings.reduce((sum, t) => sum + t.price, 0);
      const lineTotal = unitPrice * line.qty;
      subtotal += lineTotal;

      orderItems.push({
        sandwichSlug: null,
        customSandwichId: null,
        name: "ساندویچ سفارشی",
        toppingIds: lineToppings.map((t) => t.id),
        toppingNames: lineToppings.map((t) => t.name),
        qty: line.qty,
        unitPrice,
        lineTotal,
      });
      continue;
    }

    // ── Standard menu sandwich line ──
    const s = sandwichBySlug.get(line.sandwichSlug);
    if (!s) return { ok: false, error: "یکی از ساندویچ‌ها یافت نشد." };

    const lineToppings = line.toppingIds
      .map((id) => toppingById.get(id))
      .filter((t): t is NonNullable<typeof t> => !!t);
    lineToppings.forEach((t) => cartIngredientIds.add(t.id));
    s.includedIngredients
      .map((name) => ingredientIdByName.get(name))
      .filter((id): id is string => !!id)
      .forEach((id) => cartIngredientIds.add(id));

    const unitPrice =
      s.basePrice + lineToppings.reduce((sum, t) => sum + t.price, 0);
    const lineTotal = unitPrice * line.qty;
    subtotal += lineTotal;

    orderItems.push({
      sandwichSlug: s.slug,
      name: s.name,
      toppingIds: lineToppings.map((t) => t.id),
      toppingNames: lineToppings.map((t) => t.name),
      qty: line.qty,
      unitPrice,
      lineTotal,
    });
  }

  const deliveryFee = input.method === "delivery" ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  if (user) {
    const [allergies, savedAddresses] = await Promise.all([
      prisma.userAllergy.findMany({
        where: { userId: user.id },
        include: { ingredient: { select: { id: true, name: true } } },
      }),
      prisma.address.findMany({
        where: { userId: user.id },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      }),
    ]);

    if (
      input.method === "delivery" &&
      savedAddresses.length > 0 &&
      !input.addressId
    ) {
      return {
        ok: false,
        code: "ADDRESS_REQUIRED",
        error: "لطفاً یکی از آدرس‌های ذخیره‌شده را انتخاب کنید.",
      };
    }

    const allergySet = new Set(allergies.map((a) => a.ingredientId));
    const hits = Array.from(cartIngredientIds)
      .filter((id) => allergySet.has(id))
      .map(
        (id) => allergies.find((a) => a.ingredientId === id)?.ingredient.name,
      )
      .filter((name): name is string => !!name);

    if (hits.length > 0 && !input.confirmAllergyWarning) {
      return {
        ok: false,
        code: "ALLERGY_CONFLICT",
        error: "این سفارش با حساسیت‌های ثبت‌شده شما تداخل دارد.",
        allergens: hits,
      };
    }
  }

  // Resolve address text from a saved address when provided.
  let addressText = input.addressText ?? null;
  let addressId: string | null = null;
  if (input.addressId && user) {
    const addr = await prisma.address.findFirst({
      where: { id: input.addressId, userId: user.id },
    });
    if (addr) {
      addressId = addr.id;
      addressText = `${addr.province}، ${addr.city}، ${addr.street}${
        addr.alley ? `، کوچه ${addr.alley}` : ""
      }${addr.buildingNumber ? `، پلاک ${addr.buildingNumber}` : ""}`;
    }
  }

  // Session can be stale after DB reset/seed; avoid FK failures by attaching
  // the order only when the current user id still exists in DB.
  const userExists = user
    ? await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true },
      })
    : null;

  const order = await createOrder({
    userId: userExists?.id ?? null,
    method: input.method === "delivery" ? "DELIVERY" : "PICKUP",
    subtotal,
    deliveryFee,
    total,
    addressId,
    customerName: input.name,
    customerPhone: input.phone,
    addressText,
    note: input.note ?? null,
    items: orderItems,
  });

  // Bump order counters for any community sandwiches purchased (feature 4/7).
  await Promise.all(
    Array.from(new Set(orderedCustomIds)).map((id) =>
      incrementCustomOrders(id),
    ),
  );

  return { ok: true, orderNumber: order.number, orderId: order.id };
}
