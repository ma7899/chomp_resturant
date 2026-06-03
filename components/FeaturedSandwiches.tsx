"use client";

import SandwichCard from "./SandwichCard";
import { useSandwiches } from "@/lib/menu";

export default function FeaturedSandwiches({ limit }: { limit?: number }) {
  const all = useSandwiches();
  const items = limit ? all.slice(0, limit) : all;
  return (
    <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((s) => (
        <SandwichCard key={s.id} s={s} />
      ))}
    </div>
  );
}
