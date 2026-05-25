"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  Plus,
  ShoppingBag,
} from "lucide-react";
import clsx from "clsx";
import {
  ALL_TOPPINGS,
  CHEESES,
  PROTEINS,
  SANDWICHES,
  SAUCES,
  VEGGIES,
  formatPrice,
  getSandwich,
  getTopping,
  type Sandwich,
  type Topping,
} from "@/lib/menu";
import { useCart } from "@/lib/cart";

type StepId = "base" | "protein" | "cheese" | "veggie" | "sauce" | "review";

const STEPS: { id: StepId; title: string; subtitle: string }[] = [
  { id: "base", title: "پایه", subtitle: "ساندویچ پایه را انتخاب کنید" },
  {
    id: "protein",
    title: "پروتئین اضافه",
    subtitle: "پروتئین بیشتر می‌خواهید؟",
  },
  { id: "cheese", title: "پنیر", subtitle: "پنیرهای دلخواه" },
  { id: "veggie", title: "سبزیجات", subtitle: "هرچقدر می‌خواهید اضافه کنید" },
  { id: "sauce", title: "سس‌ها", subtitle: "سس‌های مورد علاقه" },
  { id: "review", title: "بررسی نهایی", subtitle: "همه چیز درست است؟" },
];

export default function BuildFlow({ initialSlug }: { initialSlug?: string }) {
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);
  const [stepIdx, setStepIdx] = useState(0);
  const [slug, setSlug] = useState<string | undefined>(initialSlug);
  const [toppings, setToppings] = useState<string[]>([]);
  const [qty, setQty] = useState(1);

  const step = STEPS[stepIdx];
  const sandwich = slug ? getSandwich(slug) : undefined;

  const total = useMemo(() => {
    const base = sandwich?.basePrice ?? 0;
    const extras = toppings.reduce(
      (sum, id) => sum + (getTopping(id)?.price ?? 0),
      0,
    );
    return (base + extras) * qty;
  }, [sandwich, toppings, qty]);

  const canNext = step.id === "base" ? !!slug : true;

  const next = () => {
    if (!canNext) return;
    if (stepIdx < STEPS.length - 1) setStepIdx(stepIdx + 1);
  };
  const prev = () => stepIdx > 0 && setStepIdx(stepIdx - 1);

  const toggleTopping = (id: string) =>
    setToppings((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const submit = () => {
    if (!sandwich) return;
    addItem({ sandwichSlug: sandwich.slug, toppingIds: toppings, qty });
    router.push("/checkout");
  };

  return (
    <div className="container-x py-8 md:py-12 pb-32 md:pb-12">
      <header className="mb-6 md:mb-10">
        <span className="chip">ساخت ساندویچ</span>
        <h1 className="heading text-3xl md:text-4xl font-black mt-2">
          ساندویچ خودت رو بساز
        </h1>
        <p className="text-ink-500 mt-2 text-sm md:text-base">
          {step.subtitle}
        </p>
      </header>

      {/* Stepper */}
      <ol className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:gap-3">
        {STEPS.map((s, i) => {
          const done = i < stepIdx;
          const active = i === stepIdx;
          return (
            <li key={s.id} className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => i <= stepIdx && setStepIdx(i)}
                className={clsx(
                  "flex items-center gap-2 rounded-full px-3 py-2 text-xs md:text-sm transition-all",
                  active && "bg-brand-500 text-white shadow-glow font-bold",
                  done && "bg-brand-100 text-brand-700",
                  !active &&
                    !done &&
                    "bg-white text-ink-400 border border-ink-100",
                )}>
                <span
                  className={clsx(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                    active && "bg-white text-brand-600",
                    done && "bg-brand-500 text-white",
                    !active && !done && "bg-ink-100 text-ink-500",
                  )}>
                  {done ? <Check size={12} /> : i + 1}
                </span>
                {s.title}
              </button>
              {i < STEPS.length - 1 && (
                <span className="text-ink-300 hidden md:inline">—</span>
              )}
            </li>
          );
        })}
      </ol>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8 mt-8">
        {/* Main step */}
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}>
              {step.id === "base" && (
                <BaseStep
                  selected={slug}
                  onSelect={(s) => {
                    setSlug(s);
                  }}
                />
              )}
              {step.id === "protein" && (
                <ToppingsGrid
                  items={PROTEINS}
                  selected={toppings}
                  onToggle={toggleTopping}
                />
              )}
              {step.id === "cheese" && (
                <ToppingsGrid
                  items={CHEESES}
                  selected={toppings}
                  onToggle={toggleTopping}
                />
              )}
              {step.id === "veggie" && (
                <ToppingsGrid
                  items={VEGGIES}
                  selected={toppings}
                  onToggle={toggleTopping}
                />
              )}
              {step.id === "sauce" && (
                <ToppingsGrid
                  items={SAUCES}
                  selected={toppings}
                  onToggle={toggleTopping}
                />
              )}
              {step.id === "review" && sandwich && (
                <ReviewStep
                  sandwich={sandwich}
                  toppings={toppings}
                  qty={qty}
                  setQty={setQty}
                  onRemoveTopping={(id) =>
                    setToppings((p) => p.filter((x) => x !== id))
                  }
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sidebar summary (desktop) */}
        <aside className="hidden lg:block">
          <SummaryCard
            sandwich={sandwich}
            toppings={toppings}
            qty={qty}
            total={total}
            canSubmit={!!sandwich}
            onSubmit={submit}
          />
        </aside>
      </div>

      {/* Bottom bar (mobile) */}
      <div className="fixed lg:hidden bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t shadow-2xl">
        <div className="container-x py-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] text-ink-400">جمع کل</div>
            <div className="font-black tabular text-lg">
              {formatPrice(total)}
              <span className="text-xs font-normal"> تومان</span>
            </div>
          </div>
          <div className="flex gap-2">
            {stepIdx > 0 && (
              <button onClick={prev} className="btn-ghost !py-2 !px-3 text-sm">
                <ChevronLeft size={16} /> قبل
              </button>
            )}
            {stepIdx < STEPS.length - 1 ? (
              <button
                onClick={next}
                disabled={!canNext}
                className="btn-primary !py-2 !px-4 text-sm">
                مرحله بعد <ArrowLeft size={16} />
              </button>
            ) : (
              <button
                onClick={submit}
                className="btn-primary !py-2 !px-4 text-sm">
                ثبت سفارش <ShoppingBag size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop nav buttons under main */}
      <div className="hidden lg:flex items-center justify-between mt-8">
        <button onClick={prev} disabled={stepIdx === 0} className="btn-ghost">
          <ChevronLeft size={18} /> مرحله قبل
        </button>
        {stepIdx < STEPS.length - 1 ? (
          <button onClick={next} disabled={!canNext} className="btn-primary">
            ادامه <ArrowLeft size={18} />
          </button>
        ) : (
          <button onClick={submit} className="btn-primary">
            افزودن به سبد و ادامه <ShoppingBag size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- Steps ---------- */

function BaseStep({
  selected,
  onSelect,
}: {
  selected?: string;
  onSelect: (slug: string) => void;
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {SANDWICHES.map((s) => {
        const active = selected === s.slug;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.slug)}
            className={clsx(
              "group relative text-right rounded-3xl overflow-hidden bg-white border-2 transition-all",
              active
                ? "border-brand-500 shadow-glow"
                : "border-ink-100 hover:border-brand-300",
            )}>
            <div className="relative aspect-[16/10]">
              <Image
                src={s.image}
                alt={s.name}
                fill
                sizes="(max-width:640px) 100vw, 50vw"
                className="object-cover"
              />
              {active && (
                <span className="absolute top-3 left-3 bg-brand-500 text-white rounded-full p-1.5 shadow">
                  <Check size={16} />
                </span>
              )}
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">{s.name}</h3>
                <span className="text-brand-600 font-bold tabular text-sm">
                  {formatPrice(s.basePrice)} T
                </span>
              </div>
              <p className="text-xs text-ink-500 mt-2 leading-6 line-clamp-2">
                {s.description}
              </p>
              <p className="text-[11px] text-ink-400 mt-3 leading-6">
                شامل: {s.includedIngredients.join("، ")}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ToppingsGrid({
  items,
  selected,
  onToggle,
}: {
  items: Topping[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {items.map((t) => {
        const active = selected.includes(t.id);
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onToggle(t.id)}
            className={clsx(
              "relative rounded-2xl p-4 text-right border-2 transition-all bg-white",
              active
                ? "border-brand-500 bg-brand-50 shadow-glow"
                : "border-ink-100 hover:border-brand-300",
            )}>
            <div className="flex items-start justify-between gap-2">
              <span className="font-bold text-sm">{t.name}</span>
              <span
                className={clsx(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs transition",
                  active
                    ? "bg-brand-500 text-white"
                    : "bg-ink-100 text-ink-400",
                )}>
                {active ? <Check size={14} /> : <Plus size={14} />}
              </span>
            </div>
            <div className="mt-3 font-bold text-brand-600 tabular text-sm">
              + {formatPrice(t.price)}{" "}
              <span className="text-[10px] text-ink-400">تومان</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ReviewStep({
  sandwich,
  toppings,
  qty,
  setQty,
  onRemoveTopping,
}: {
  sandwich: Sandwich;
  toppings: string[];
  qty: number;
  setQty: (n: number) => void;
  onRemoveTopping: (id: string) => void;
}) {
  return (
    <div className="rounded-3xl bg-white border border-ink-100 overflow-hidden">
      <div className="relative aspect-[21/9]">
        <Image
          src={sandwich.image}
          alt={sandwich.name}
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="p-6 space-y-5">
        <div>
          <h3 className="text-2xl font-black">{sandwich.name}</h3>
          <p className="text-ink-500 mt-2 leading-7 text-sm">
            {sandwich.description}
          </p>
        </div>

        <div>
          <h4 className="font-bold mb-2">مواد پایه</h4>
          <div className="flex flex-wrap gap-2">
            {sandwich.includedIngredients.map((i) => (
              <span key={i} className="chip">
                {i}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-bold mb-2">افزودنی‌های شما</h4>
          {toppings.length === 0 ? (
            <p className="text-sm text-ink-400">هیچ افزودنی انتخاب نشده است.</p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {toppings.map((id) => {
                const t = getTopping(id);
                if (!t) return null;
                return (
                  <li
                    key={id}
                    className="flex items-center justify-between py-2 text-sm">
                    <span>{t.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-brand-600 font-bold tabular">
                        +{formatPrice(t.price)}
                      </span>
                      <button
                        onClick={() => onRemoveTopping(id)}
                        className="text-xs text-ink-400 hover:text-red-500">
                        حذف
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-ink-100">
          <span className="font-bold">تعداد</span>
          <div className="inline-flex items-center bg-brand-50 rounded-full">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-9 h-9 rounded-full"
              aria-label="کم">
              −
            </button>
            <span className="px-4 font-bold tabular">{qty}</span>
            <button
              onClick={() => setQty(qty + 1)}
              className="w-9 h-9 rounded-full"
              aria-label="زیاد">
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  sandwich,
  toppings,
  qty,
  total,
  canSubmit,
  onSubmit,
}: {
  sandwich?: Sandwich;
  toppings: string[];
  qty: number;
  total: number;
  canSubmit: boolean;
  onSubmit: () => void;
}) {
  return (
    <div className="sticky top-24 rounded-3xl bg-white border border-ink-100 overflow-hidden shadow-card">
      <div className="p-5 bg-gradient-to-bl from-brand-500 to-brand-600 text-white">
        <h3 className="font-bold">سفارش شما</h3>
        <p className="text-xs text-white/80 mt-1">همه چیز قابل ویرایش است</p>
      </div>
      <div className="p-5 space-y-4">
        {sandwich ? (
          <>
            <div className="flex gap-3">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                <Image
                  src={sandwich.image}
                  alt={sandwich.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div>
                <div className="font-bold text-sm">{sandwich.name}</div>
                <div className="text-xs text-ink-500 tabular mt-1">
                  پایه: {formatPrice(sandwich.basePrice)} تومان
                </div>
              </div>
            </div>

            {toppings.length > 0 && (
              <div className="border-t border-ink-100 pt-3 space-y-1.5 max-h-48 overflow-y-auto">
                {toppings.map((id) => {
                  const t = getTopping(id);
                  if (!t) return null;
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between text-xs">
                      <span className="text-ink-700">{t.name}</span>
                      <span className="tabular text-brand-600 font-bold">
                        +{formatPrice(t.price)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="border-t border-ink-100 pt-3 flex items-center justify-between text-sm">
              <span>تعداد</span>
              <span className="font-bold tabular">{qty}</span>
            </div>

            <div className="border-t border-ink-100 pt-3 flex items-center justify-between">
              <span className="text-sm">جمع کل</span>
              <span className="font-black text-lg tabular text-brand-700">
                {formatPrice(total)} <span className="text-xs">تومان</span>
              </span>
            </div>

            <button
              onClick={onSubmit}
              disabled={!canSubmit}
              className="btn-primary w-full">
              افزودن به سبد <ArrowLeft size={16} />
            </button>
          </>
        ) : (
          <p className="text-sm text-ink-500">
            ابتدا یک ساندویچ پایه انتخاب کنید.
          </p>
        )}
      </div>
    </div>
  );
}
