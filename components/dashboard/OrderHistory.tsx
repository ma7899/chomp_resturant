"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, ShoppingBag, ChevronDown } from "lucide-react";
import clsx from "clsx";
import { useCart } from "@/lib/cart";
import { getSandwich } from "@/lib/menu";
import { formatPrice, formatDateFa } from "@/lib/format";

type OrderItemView = {
  sandwichSlug: string | null;
  customSandwichId: string | null;
  name: string;
  toppingIds: string[];
  toppingNames: string[];
  qty: number;
  lineTotal: number;
};

type OrderView = {
  id: string;
  number: number;
  date: string;
  status: "NEW" | "PREPARING" | "DELIVERED" | "CANCELLED";
  total: number;
  items: OrderItemView[];
};

const STATUS: Record<OrderView["status"], { label: string; cls: string }> = {
  NEW: { label: "ثبت‌شده", cls: "bg-blue-50 text-blue-700" },
  PREPARING: { label: "در حال آماده‌سازی", cls: "bg-amber-50 text-amber-700" },
  DELIVERED: { label: "تحویل‌شده", cls: "bg-green-50 text-green-700" },
  CANCELLED: { label: "لغوشده", cls: "bg-red-50 text-red-700" },
};

export default function OrderHistory({ orders }: { orders: OrderView[] }) {
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);
  const openCart = useCart((s) => s.open);
  const [expanded, setExpanded] = useState<string | null>(null);

  /** Push every re-orderable line back into the cart. */
  function reorder(order: OrderView, goCheckout = false) {
    let added = 0;
    for (const it of order.items) {
      const unitPrice = Math.round(it.lineTotal / Math.max(1, it.qty));

      if (it.customSandwichId) {
        addItem({
          sandwichSlug: it.sandwichSlug ?? "custom",
          toppingIds: it.toppingIds,
          qty: it.qty,
          customSandwichId: it.customSandwichId,
          customName: it.name,
          customPrice: unitPrice,
        });
        added++;
        continue;
      }

      if (!it.sandwichSlug) {
        addItem({
          sandwichSlug: "custom",
          toppingIds: it.toppingIds,
          qty: it.qty,
          customName: it.name,
          customPrice: unitPrice,
        });
        added++;
        continue;
      }

      const baseName = getSandwich(it.sandwichSlug)?.name;
      addItem({
        sandwichSlug: it.sandwichSlug,
        toppingIds: it.toppingIds,
        qty: it.qty,
        customName: it.name !== baseName ? it.name : undefined,
      });
      added++;
    }
    if (added === 0) {
      alert("این سفارش آیتم قابل افزودن به سبد ندارد.");
      return;
    }
    if (goCheckout) router.push("/checkout");
    else openCart();
  }

  return (
    <div className="space-y-3">
      {orders.map((o) => {
        const open = expanded === o.id;
        const st = STATUS[o.status];
        return (
          <div
            key={o.id}
            className="rounded-3xl bg-white border border-ink-100 overflow-hidden">
            <button
              onClick={() => setExpanded(open ? null : o.id)}
              className="w-full flex items-center justify-between gap-3 p-5 text-right">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold tabular">
                  #{o.number.toLocaleString("fa-IR")}
                </span>
                <div>
                  <div className="font-bold text-sm">
                    {o.items.length.toLocaleString("fa-IR")} آیتم ·{" "}
                    {formatPrice(o.total)} تومان
                  </div>
                  <div className="text-xs text-ink-400 mt-0.5">
                    {formatDateFa(o.date)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={clsx("chip text-[11px]", st.cls)}>
                  {st.label}
                </span>
                <ChevronDown
                  size={18}
                  className={clsx(
                    "text-ink-400 transition-transform",
                    open && "rotate-180",
                  )}
                />
              </div>
            </button>

            {open && (
              <div className="px-5 pb-5 space-y-3 border-t border-ink-100 pt-4">
                <ul className="space-y-2">
                  {o.items.map((it, i) => (
                    <li
                      key={i}
                      className="flex items-start justify-between gap-3 text-sm">
                      <div>
                        <span className="font-semibold">{it.name}</span>
                        <span className="text-ink-400 tabular">
                          {" "}
                          × {it.qty.toLocaleString("fa-IR")}
                        </span>
                        {it.toppingNames.length > 0 && (
                          <p className="text-xs text-ink-400 mt-0.5 leading-5">
                            {it.toppingNames.join("، ")}
                          </p>
                        )}
                      </div>
                      <span className="tabular font-semibold whitespace-nowrap">
                        {formatPrice(it.lineTotal)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => reorder(o, true)}
                    className="btn-primary !py-2 !px-4 text-sm">
                    <RotateCcw size={16} /> سفارش مجدد
                  </button>
                  <button
                    onClick={() => reorder(o, false)}
                    className="btn-ghost !py-2 !px-4 text-sm">
                    <ShoppingBag size={16} /> افزودن به سبد
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
