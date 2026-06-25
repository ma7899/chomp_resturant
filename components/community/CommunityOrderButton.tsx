"use client";

import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";

type CommunitySandwich = {
  id: string;
  name: string;
  baseSlug: string | null;
  basePrice: number;
  ingredientIds: string[];
};

export default function CommunityOrderButton({
  sandwich,
  variant = "default",
}: {
  sandwich: CommunitySandwich;
  variant?: "default" | "hero";
}) {
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);
  const openCart = useCart((s) => s.open);

  function order() {
    // Always pass customSandwichId so the order item stays linked to this
    // community sandwich (enables rating + aggregate updates after delivery).
    addItem({
      sandwichSlug: sandwich.baseSlug ?? "custom",
      toppingIds: sandwich.ingredientIds,
      qty: 1,
      customSandwichId: sandwich.id,
      customName: sandwich.name,
      customPrice: sandwich.basePrice,
    });
    openCart();
  }

  return (
    <button
      onClick={order}
      className={
        variant === "hero"
          ? "w-full inline-flex items-center justify-center gap-2 rounded-full bg-white text-brand-600 font-bold py-2.5 hover:bg-brand-50 transition"
          : "btn-primary w-full !py-2.5 text-sm"
      }>
      <ShoppingBag size={16} /> سفارش این ساندویچ
    </button>
  );
}
