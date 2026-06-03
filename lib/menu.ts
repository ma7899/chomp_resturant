"use client";

import { useData, getSandwichBySlug, getToppingById } from "./store";
import type { Sandwich, Topping, ToppingCategory } from "./types";

// Re-export the shared types so existing imports keep working.
export type { Sandwich, Topping, ToppingCategory } from "./types";

/* ───────── React hooks (live, reflect admin edits) ───────── */

export const useSandwiches = () => useData((s) => s.sandwiches);
export const useToppings = () => useData((s) => s.toppings);
export const useTags = () => useData((s) => s.tags);

export const useToppingsByCategory = (c: ToppingCategory) =>
  useData((s) => s.toppings.filter((t) => t.category === c));

export const useProteins = () => useToppingsByCategory("protein");
export const useCheeses = () => useToppingsByCategory("cheese");
export const useVeggies = () => useToppingsByCategory("veggie");
export const useSauces = () => useToppingsByCategory("sauce");

/* ───────── Non-react getters (cart helpers, SSR fallback, etc.) ───────── */

export function getSandwich(slug: string): Sandwich | undefined {
  return getSandwichBySlug(slug);
}

export function getTopping(id: string): Topping | undefined {
  return getToppingById(id);
}

/* ───────── Formatting ───────── */

export function formatPrice(t: number) {
  return new Intl.NumberFormat("fa-IR").format(t);
}
