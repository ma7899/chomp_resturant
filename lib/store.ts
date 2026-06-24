"use client";

import { create } from "zustand";
import {
  SEED_SANDWICHES,
  SEED_TAGS,
  SEED_TASTE_FORM,
  SEED_TOPPINGS,
} from "./seed";
import type {
  Order,
  Question,
  Review,
  Sandwich,
  Tag,
  TasteForm,
  Topping,
} from "./types";
import { safeUUID } from "./uuid";

type State = {
  sandwiches: Sandwich[];
  toppings: Topping[];
  tags: Tag[];
  reviews: Review[];
  orders: Order[];
  tasteForm: TasteForm;

  // ── sandwiches ──
  upsertSandwich: (s: Sandwich) => void;
  deleteSandwich: (id: string) => void;

  // ── toppings ──
  upsertTopping: (t: Topping) => void;
  deleteTopping: (id: string) => void;

  // ── tags ──
  upsertTag: (t: Tag) => void;
  deleteTag: (id: string) => void;

  // ── reviews ──
  addReview: (r: Omit<Review, "id" | "date">) => void;
  deleteReview: (id: string) => void;

  // ── orders ──
  addOrder: (o: Omit<Order, "id" | "date" | "status">) => Order;
  setOrderStatus: (id: string, status: Order["status"]) => void;
  deleteOrder: (id: string) => void;

  // ── taste form ──
  setTasteForm: (f: TasteForm) => void;
  upsertQuestion: (q: Question) => void;
  deleteQuestion: (id: string) => void;

  // ── maintenance ──
  resetAll: () => void;
};

const initial = {
  sandwiches: SEED_SANDWICHES,
  toppings: SEED_TOPPINGS,
  tags: SEED_TAGS,
  reviews: [] as Review[],
  orders: [] as Order[],
  tasteForm: SEED_TASTE_FORM,
};

export const useData = create<State>()((set) => ({
  ...initial,

  upsertSandwich: (s) =>
    set((state) => {
      const idx = state.sandwiches.findIndex((x) => x.id === s.id);
      const next = [...state.sandwiches];
      if (idx >= 0) next[idx] = s;
      else next.push(s);
      return { sandwiches: next };
    }),
  deleteSandwich: (id) =>
    set((state) => ({
      sandwiches: state.sandwiches.filter((x) => x.id !== id),
    })),

  upsertTopping: (t) =>
    set((state) => {
      const idx = state.toppings.findIndex((x) => x.id === t.id);
      const next = [...state.toppings];
      if (idx >= 0) next[idx] = t;
      else next.push(t);
      return { toppings: next };
    }),
  deleteTopping: (id) =>
    set((state) => ({
      toppings: state.toppings.filter((x) => x.id !== id),
    })),

  upsertTag: (t) =>
    set((state) => {
      const idx = state.tags.findIndex((x) => x.id === t.id);
      const next = [...state.tags];
      if (idx >= 0) next[idx] = t;
      else next.push(t);
      return { tags: next };
    }),
  deleteTag: (id) =>
    set((state) => ({
      tags: state.tags.filter((x) => x.id !== id),
      // also strip from items
      sandwiches: state.sandwiches.map((s) => ({
        ...s,
        tagIds: s.tagIds.filter((x) => x !== id),
      })),
      toppings: state.toppings.map((t) => ({
        ...t,
        tagIds: t.tagIds.filter((x) => x !== id),
      })),
      tasteForm: {
        ...state.tasteForm,
        questions: state.tasteForm.questions.map((q) => ({
          ...q,
          options: q.options.map((o) => ({
            ...o,
            tagBoosts: o.tagBoosts.filter((b) => b.tagId !== id),
          })),
        })),
      },
    })),

  addReview: (r) =>
    set((state) => ({
      reviews: [
        { ...r, id: safeUUID(), date: new Date().toISOString() },
        ...state.reviews,
      ],
    })),
  deleteReview: (id) =>
    set((state) => ({
      reviews: state.reviews.filter((x) => x.id !== id),
    })),

  addOrder: (o) => {
    const order: Order = {
      ...o,
      id: safeUUID(),
      date: new Date().toISOString(),
      status: "new",
    };
    set((state) => ({ orders: [order, ...state.orders] }));
    return order;
  },
  setOrderStatus: (id, status) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    })),
  deleteOrder: (id) =>
    set((state) => ({
      orders: state.orders.filter((o) => o.id !== id),
    })),

  setTasteForm: (f) => set({ tasteForm: f }),
  upsertQuestion: (q) =>
    set((state) => {
      const idx = state.tasteForm.questions.findIndex((x) => x.id === q.id);
      const next = [...state.tasteForm.questions];
      if (idx >= 0) next[idx] = q;
      else next.push(q);
      return { tasteForm: { ...state.tasteForm, questions: next } };
    }),
  deleteQuestion: (id) =>
    set((state) => ({
      tasteForm: {
        ...state.tasteForm,
        questions: state.tasteForm.questions.filter((q) => q.id !== id),
      },
    })),

  resetAll: () => set({ ...initial }),
}));

/* ───────── Non-react accessors (used by cart helpers, SSR, etc.) ───────── */

export function getSandwichBySlug(slug: string): Sandwich | undefined {
  return useData.getState().sandwiches.find((s) => s.slug === slug);
}

export function getToppingById(id: string): Topping | undefined {
  return useData.getState().toppings.find((t) => t.id === id);
}

export function getTagById(id: string): Tag | undefined {
  return useData.getState().tags.find((t) => t.id === id);
}

/* ───────── Recommendation engine ───────── */

export function recommendSandwich(
  scores: Record<string, number>,
  sandwiches: Sandwich[],
): {
  sandwich: Sandwich | null;
  ranked: { sandwich: Sandwich; score: number }[];
} {
  if (sandwiches.length === 0) return { sandwich: null, ranked: [] };
  const ranked = sandwiches
    .map((s) => {
      const score = s.tagIds.reduce((sum, t) => sum + (scores[t] ?? 0), 0);
      return { sandwich: s, score };
    })
    .sort((a, b) => b.score - a.score);
  return { sandwich: ranked[0]?.sandwich ?? null, ranked };
}
