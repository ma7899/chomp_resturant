"use client";

import { create } from "zustand";
import { getSandwich, getTopping } from "./menu";
import { safeUUID } from "./uuid";

export type CartItem = {
  id: string; // unique line id
  sandwichSlug: string;
  toppingIds: string[];
  note?: string;
  qty: number;
  // Set when this line is a community / custom sandwich (no menu base).
  customSandwichId?: string;
  customName?: string;
  customPrice?: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

export const useCart = create<CartState>()((set) => ({
  items: [],
  isOpen: false,
  addItem: (item) =>
    set((s) => ({
      items: [...s.items, { ...item, id: safeUUID(), qty: Math.max(1, item.qty) }],
      isOpen: true,
    })),
  removeItem: (id) =>
    set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  updateQty: (id, qty) =>
    set((s) => ({
      items: s.items.map((i) =>
        i.id === id ? { ...i, qty: Math.max(1, qty) } : i,
      ),
    })),
  clear: () => set({ items: [] }),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}));

export function lineTotal(item: CartItem) {
  // Custom / community sandwiches carry their own price.
  if (item.customPrice != null) {
    return item.customPrice * item.qty;
  }
  const s = getSandwich(item.sandwichSlug);
  const base = s?.basePrice ?? 0;
  const extras = item.toppingIds.reduce(
    (sum, id) => sum + (getTopping(id)?.price ?? 0),
    0,
  );
  return (base + extras) * item.qty;
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + lineTotal(i), 0);
}

export function cartCount(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.qty, 0);
}
