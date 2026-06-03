// Domain types shared between data layer, admin panel and public pages.

export type ToppingCategory = "protein" | "veggie" | "cheese" | "sauce";

export type Tag = {
  id: string;
  name: string;
  /** Tailwind class fragment for chip color, e.g. "rose", "emerald". */
  color?: string;
};

export type Topping = {
  id: string;
  name: string;
  price: number;
  category: ToppingCategory;
  description?: string;
  /** ids of tags applied to this topping. */
  tagIds: string[];
};

export type Sandwich = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  basePrice: number;
  includedIngredients: string[];
  image: string;
  badge?: string;
  hero?: boolean;
  tagIds: string[];
};

export type Review = {
  id: string;
  itemType: "sandwich" | "topping";
  /** sandwich slug or topping id. */
  itemId: string;
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  /** ISO date string. */
  date: string;
};

export type OrderLineItem = {
  sandwichSlug: string;
  sandwichName: string;
  toppingIds: string[];
  toppingNames: string[];
  qty: number;
  unitPrice: number;
  lineTotal: number;
};

export type OrderStatus = "new" | "preparing" | "delivered" | "cancelled";

export type Order = {
  id: string;
  /** ISO date string. */
  date: string;
  items: OrderLineItem[];
  subtotal: number;
  delivery: number;
  total: number;
  customer: {
    name: string;
    phone: string;
    address?: string;
    note?: string;
    method: "delivery" | "pickup";
  };
  status: OrderStatus;
};

// ───────── Dynamic taste form ─────────

export type QuestionType = "single" | "multi" | "scale";

export type QuestionOption = {
  id: string;
  label: string;
  /** Each selection boosts the listed tag ids by `weight` (default 1). */
  tagBoosts: { tagId: string; weight: number }[];
};

export type Question = {
  id: string;
  text: string;
  /** Optional helper / sub text */
  help?: string;
  type: QuestionType;
  options: QuestionOption[];
};

export type TasteForm = {
  title: string;
  intro: string;
  questions: Question[];
};
