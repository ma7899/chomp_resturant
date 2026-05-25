"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { cartCount, cartTotal, lineTotal, useCart } from "@/lib/cart";
import { formatPrice, getSandwich, getTopping } from "@/lib/menu";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";

export default function CartDrawer() {
  const { items, isOpen, close, removeItem, updateQty } = useCart();
  const total = cartTotal(items);
  const count = cartCount(items);

  // Lock the page behind the cart while the drawer is open.
  useBodyScrollLock(isOpen);

  // Close on Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60]"
          role="dialog"
          aria-modal="true"
          aria-label="سبد خرید"
          initial="closed"
          animate="open"
          exit="closed">
          <motion.div
            onClick={close}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            style={{ touchAction: "none" }}
            variants={{ open: { opacity: 1 }, closed: { opacity: 0 } }}
          />
          <motion.aside
            className="absolute top-0 left-0 h-[100dvh] w-full sm:w-[420px] bg-white shadow-2xl flex flex-col will-change-transform"
            variants={{
              open: { x: 0 },
              closed: { x: "-100%" },
            }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}>
            <header className="flex items-center justify-between p-5 border-b border-ink-100">
              <h2 className="font-display font-extrabold text-lg flex items-center gap-2 tracking-tight">
                <ShoppingBag size={20} className="text-brand-500" />
                سبد خرید
                <span className="text-sm font-medium text-ink-400 tabular">
                  ({count})
                </span>
              </h2>
              <button
                onClick={close}
                aria-label="بستن"
                className="btn-ghost !px-2 !py-2">
                <X size={20} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto drawer-scroll p-5 space-y-4">
              {items.length === 0 && (
                <div className="text-center py-16 text-ink-400">
                  <ShoppingBag size={48} className="mx-auto mb-4 opacity-40" />
                  <p className="text-base">سبد خرید شما خالی است</p>
                  <Link
                    href="/menu"
                    onClick={close}
                    className="btn-primary mt-6 inline-flex">
                    مشاهده منو
                  </Link>
                </div>
              )}

              {items.map((item) => {
                const s = getSandwich(item.sandwichSlug);
                if (!s) return null;
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-ink-100 p-4 bg-brand-50/40">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display font-bold text-base tracking-tight">
                          {s.name}
                        </h3>
                        {item.toppingIds.length > 0 && (
                          <p className="text-xs text-ink-500 mt-1 leading-6">
                            افزودنی:{" "}
                            {item.toppingIds
                              .map((id) => getTopping(id)?.name)
                              .filter(Boolean)
                              .join("، ")}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-ink-400 hover:text-red-500"
                        aria-label="حذف">
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center bg-white rounded-full border border-ink-100">
                        <button
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          className="p-2"
                          aria-label="کم کردن">
                          <Minus size={14} />
                        </button>
                        <span className="px-3 font-bold tabular">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          className="p-2"
                          aria-label="اضافه کردن">
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="price text-brand-700">
                        {formatPrice(lineTotal(item))}{" "}
                        <span className="text-xs font-medium text-ink-500">
                          تومان
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {items.length > 0 && (
              <footer className="border-t border-ink-100 p-5 space-y-3 bg-white">
                <div className="flex items-center justify-between text-sm text-ink-500">
                  <span>جمع کل</span>
                  <span className="price text-xl text-ink-900">
                    {formatPrice(total)}{" "}
                    <span className="text-xs font-medium text-ink-500">
                      تومان
                    </span>
                  </span>
                </div>
                <Link
                  href="/checkout"
                  onClick={close}
                  className="btn-primary w-full">
                  ادامه و ثبت سفارش
                </Link>
              </footer>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
