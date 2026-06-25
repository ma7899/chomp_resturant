import "server-only";
import { prisma } from "@/lib/db";
import type { OrderMethod } from "@prisma/client";

/**
 * Order repository (Phase 4 / feature 1).
 * Create orders, list a user's history, fetch a single owned order.
 */

export type NewOrderItem = {
  sandwichSlug?: string | null;
  customSandwichId?: string | null;
  name: string;
  toppingIds: string[];
  toppingNames: string[];
  qty: number;
  unitPrice: number;
  lineTotal: number;
};

export type NewOrderInput = {
  userId?: string | null;
  method: OrderMethod;
  subtotal: number;
  deliveryFee: number;
  discountId?: string | null;
  discountAmount?: number;
  total: number;
  addressId?: string | null;
  customerName: string;
  customerPhone: string;
  addressText?: string | null;
  note?: string | null;
  items: NewOrderItem[];
};

export async function createOrder(input: NewOrderInput) {
  const { items, ...order } = input;
  return prisma.order.create({
    data: {
      ...order,
      discountAmount: order.discountAmount ?? 0,
      items: { create: items },
    },
    include: { items: true },
  });
}

export async function listUserOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
}

export async function getUserOrder(userId: string, id: string) {
  return prisma.order.findFirst({
    where: { id, userId },
    include: { items: true, address: true },
  });
}

/** Admin: List all orders with items. */
export async function listAllOrders() {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true, user: { select: { name: true, phone: true } } },
  });
}

/** Admin: Update order status. */
export async function updateOrderStatus(
  id: string,
  status: import("@prisma/client").OrderStatus,
) {
  return prisma.order.update({ where: { id }, data: { status } });
}

/** Lightweight spend/summary stats for the customer dashboard overview. */
export async function getUserOrderStats(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    select: { total: true, items: { select: { name: true, qty: true } } },
  });
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((s, o) => s + o.total, 0);

  // Favorite sandwich by quantity.
  const counts = new Map<string, number>();
  for (const o of orders) {
    for (const it of o.items) {
      counts.set(it.name, (counts.get(it.name) ?? 0) + it.qty);
    }
  }
  let favorite: string | null = null;
  let max = 0;
  for (const [name, n] of counts) {
    if (n > max) {
      max = n;
      favorite = name;
    }
  }
  return { totalOrders, totalSpent, favorite };
}
