"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  Minus,
  Plus,
  ShoppingBag,
} from "lucide-react";
import clsx from "clsx";
import {
  formatPrice,
  getSandwich,
  getTopping,
  useCheeses,
  useProteins,
  useSandwiches,
  useSauces,
  useVeggies,
  type Sandwich,
  type Topping,
} from "@/lib/menu";
import { useCart } from "@/lib/cart";
import SaveSandwichDialog from "@/components/SaveSandwichDialog";

type SavedBuildSandwich = {
  id: string;
  name: string;
  baseSlug: string | null;
  ingredientIds: string[];
};

function countById(ids: string[]) {
  const m: Record<string, number> = {};
  for (const id of ids) m[id] = (m[id] ?? 0) + 1;
  return m;
}

function removeOneOccurrence(ids: string[], target: string) {
  const idx = ids.indexOf(target);
  if (idx === -1) return ids;
  return [...ids.slice(0, idx), ...ids.slice(idx + 1)];
}

type StepId = "base" | "protein" | "cheese" | "veggie" | "sauce" | "review";

const STEPS: { id: StepId; title: string; subtitle: string }[] = [
  {
    id: "base",
    title: "پایه",
    subtitle: "در صورت تمایل ساندویچ پایه انتخاب کنید",
  },
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

export default function BuildFlow({
  initialSlug,
  savedSandwiches,
}: {
  initialSlug?: string;
  savedSandwiches?: SavedBuildSandwich[];
}) {
  const router = useRouter();
  const addItem = useCart((s) => s.addItem);
  const proteins = useProteins();
  const cheeses = useCheeses();
  const veggies = useVeggies();
  const sauces = useSauces();
  const sandwiches = useSandwiches();
  const [stepIdx, setStepIdx] = useState(0);
  const [slug, setSlug] = useState<string | undefined>(initialSlug);
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null);
  const [selectedSavedName, setSelectedSavedName] = useState<string | null>(
    null,
  );
  const [lockedToppings, setLockedToppings] = useState<string[]>([]);
  const [extraToppings, setExtraToppings] = useState<string[]>([]);
  const [qty, setQty] = useState(1);

  const step = STEPS[stepIdx];
  const sandwich = slug ? getSandwich(slug) : undefined;
  const toppings = useMemo(
    () => [...lockedToppings, ...extraToppings],
    [lockedToppings, extraToppings],
  );
  const toppingCounts = useMemo(() => countById(toppings), [toppings]);
  const lockedCounts = useMemo(() => countById(lockedToppings), [lockedToppings]);
  const extraCounts = useMemo(() => countById(extraToppings), [extraToppings]);

  const total = useMemo(() => {
    const base = sandwich?.basePrice ?? 0;
    const extras = toppings.reduce(
      (sum, id) => sum + (getTopping(id)?.price ?? 0),
      0,
    );
    return (base + extras) * qty;
  }, [sandwich, toppings, qty]);

  const canNext = true;

  const next = () => {
    if (!canNext) return;
    if (stepIdx < STEPS.length - 1) setStepIdx(stepIdx + 1);
  };
  const prev = () => stepIdx > 0 && setStepIdx(stepIdx - 1);

  const addTopping = (id: string) => setExtraToppings((prev) => [...prev, id]);
  const removeTopping = (id: string) =>
    setExtraToppings((prev) => removeOneOccurrence(prev, id));

  const submit = () => {
    if (sandwich) {
      addItem({ sandwichSlug: sandwich.slug, toppingIds: toppings, qty });
    } else {
      addItem({
        sandwichSlug: "custom",
        toppingIds: toppings,
        qty,
        customName: selectedSavedName || "ساندویچ سفارشی",
        customPrice: total / Math.max(1, qty),
      });
    }
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
                  sandwiches={sandwiches}
                  savedSandwiches={savedSandwiches ?? []}
                  selected={slug}
                  selectedSavedId={selectedSavedId}
                  onSelect={(choice) => {
                    setSlug(choice.slug);
                    setSelectedSavedId(choice.savedId ?? null);
                    setSelectedSavedName(choice.savedName ?? null);
                    setLockedToppings(choice.fixedIngredientIds);
                    setExtraToppings([]);
                  }}
                />
              )}
              {step.id === "protein" && (
                <ToppingsGrid
                  items={proteins}
                  selectedCounts={toppingCounts}
                  lockedCounts={lockedCounts}
                  onAdd={addTopping}
                  onRemove={removeTopping}
                />
              )}
              {step.id === "cheese" && (
                <ToppingsGrid
                  items={cheeses}
                  selectedCounts={toppingCounts}
                  lockedCounts={lockedCounts}
                  onAdd={addTopping}
                  onRemove={removeTopping}
                />
              )}
              {step.id === "veggie" && (
                <ToppingsGrid
                  items={veggies}
                  selectedCounts={toppingCounts}
                  lockedCounts={lockedCounts}
                  onAdd={addTopping}
                  onRemove={removeTopping}
                />
              )}
              {step.id === "sauce" && (
                <ToppingsGrid
                  items={sauces}
                  selectedCounts={toppingCounts}
                  lockedCounts={lockedCounts}
                  onAdd={addTopping}
                  onRemove={removeTopping}
                />
              )}
              {step.id === "review" && sandwich && (
                <ReviewStep
                  sandwich={sandwich}
                  title={selectedSavedName ?? undefined}
                  allCounts={toppingCounts}
                  fixedCounts={lockedCounts}
                  extraCounts={extraCounts}
                  qty={qty}
                  setQty={setQty}
                  onRemoveTopping={removeTopping}
                />
              )}
              {step.id === "review" && !sandwich && (
                <ReviewCustomOnlyStep
                  allCounts={toppingCounts}
                  fixedCounts={lockedCounts}
                  extraCounts={extraCounts}
                  qty={qty}
                  setQty={setQty}
                  onRemoveTopping={removeTopping}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sidebar summary (desktop) */}
        <aside className="hidden lg:block">
          <SummaryCard
            sandwich={sandwich}
            title={selectedSavedName ?? undefined}
            toppings={toppings}
            qty={qty}
            total={total}
            canSubmit
            onSubmit={submit}
          />
        </aside>
      </div>

      {/* Bottom bar (mobile) */}
      <div className="fixed lg:hidden bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t shadow-2xl">
        <div className="container-x py-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] text-ink-400">جمع کل</div>
            <div className="price text-xl text-ink-900">
              {formatPrice(total)}
              <span className="text-xs font-medium text-ink-500"> تومان</span>
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
          <div className="flex items-center gap-2">
            {sandwich && (
              <SaveSandwichDialog
                baseSlug={sandwich?.slug ?? null}
                basePrice={total / qty}
                ingredientIds={toppings}
                defaultName={selectedSavedName ?? sandwich?.name ?? "ساندویچ سفارشی"}
              />
            )}
            {!sandwich && (
              <SaveSandwichDialog
                baseSlug={null}
                basePrice={total / qty}
                ingredientIds={toppings}
                defaultName={selectedSavedName ?? "ساندویچ سفارشی"}
              />
            )}
            <button onClick={submit} className="btn-primary">
              افزودن به سبد و ادامه <ShoppingBag size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Steps ---------- */

function BaseStep({
  sandwiches,
  savedSandwiches,
  selected,
  selectedSavedId,
  onSelect,
}: {
  sandwiches: Sandwich[];
  savedSandwiches: SavedBuildSandwich[];
  selected?: string;
  selectedSavedId: string | null;
  onSelect: (choice: {
    slug?: string;
    savedId?: string;
    savedName?: string;
    fixedIngredientIds: string[];
  }) => void;
}) {
  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => onSelect({ slug: undefined, fixedIngredientIds: [] })}
        className={clsx(
          "w-full rounded-2xl border-2 p-4 text-right transition-all",
          !selected && !selectedSavedId
            ? "border-brand-500 bg-brand-50 shadow-glow"
            : "border-ink-100 bg-white hover:border-brand-300",
        )}>
        <div className="font-bold">بدون ساندویچ پایه</div>
        <div className="text-xs text-ink-500 mt-1">
          فقط با مواد و افزودنی ها می سازم
        </div>
      </button>

      <div className="grid sm:grid-cols-2 gap-4">
        {sandwiches.map((s) => {
          const active = !selectedSavedId && selected === s.slug;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect({ slug: s.slug, fixedIngredientIds: [] })}
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
                  <span className="price text-brand-600 text-sm">
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

      {savedSandwiches.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-ink-700">
            ساندویچ‌های ثبت‌شده من
          </h4>
          <div className="grid sm:grid-cols-2 gap-3">
            {savedSandwiches.map((s) => {
              const active = selectedSavedId === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() =>
                    onSelect({
                      slug: s.baseSlug ?? undefined,
                      savedId: s.id,
                      savedName: s.name,
                      fixedIngredientIds: s.ingredientIds,
                    })
                  }
                  className={clsx(
                    "rounded-2xl border-2 p-4 text-right transition-all",
                    active
                      ? "border-brand-500 bg-brand-50 shadow-glow"
                      : "border-ink-100 bg-white hover:border-brand-300",
                  )}>
                  <div className="font-bold text-sm">{s.name}</div>
                  <p className="text-xs text-ink-500 mt-1 leading-6">
                    {s.baseSlug
                      ? "با پایه منو + مواد رسپی"
                      : "بدون پایه منو (فقط مواد رسپی)"}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewCustomOnlyStep({
  allCounts,
  fixedCounts,
  extraCounts,
  qty,
  setQty,
  onRemoveTopping,
}: {
  allCounts: Record<string, number>;
  fixedCounts: Record<string, number>;
  extraCounts: Record<string, number>;
  qty: number;
  setQty: (n: number) => void;
  onRemoveTopping: (id: string) => void;
}) {
  return (
    <div className="rounded-3xl bg-white border border-ink-100 p-6 space-y-5">
      <div>
        <h3 className="text-2xl font-black">ساندویچ سفارشی</h3>
        <p className="text-ink-500 mt-2 leading-7 text-sm">
          این سفارش بدون پایه منویی ثبت می شود و فقط شامل مواد انتخابی شماست.
        </p>
      </div>

      <div>
        <h4 className="font-bold mb-2">افزودنی ها</h4>
        {Object.keys(allCounts).length === 0 ? (
          <p className="text-sm text-ink-500">
            هنوز افزودنی ای انتخاب نشده است.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {Object.entries(allCounts).map(([id, count]) => {
              const t = getTopping(id);
              if (!t) return null;
              const fixed = fixedCounts[id] ?? 0;
              const removable = extraCounts[id] ?? 0;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onRemoveTopping(id)}
                  disabled={removable <= 0}
                  className="px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs border border-brand-200 hover:bg-brand-100 transition">
                  {t.name} × {count.toLocaleString("fa-IR")}
                  {fixed > 0 && (
                    <span className="mr-1 text-[10px] text-ink-500">
                      (پایه {fixed.toLocaleString("fa-IR")})
                    </span>
                  )}
                  <span className="mr-1">- {formatPrice(t.price)} تومان</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="inline-flex items-center gap-2 rounded-xl border border-ink-100 p-2">
        <button
          type="button"
          className="w-8 h-8 rounded-lg bg-ink-100"
          onClick={() => setQty(Math.max(1, qty - 1))}>
          -
        </button>
        <span className="w-10 text-center tabular font-bold">{qty}</span>
        <button
          type="button"
          className="w-8 h-8 rounded-lg bg-ink-100"
          onClick={() => setQty(Math.min(20, qty + 1))}>
          +
        </button>
      </div>
    </div>
  );
}

function ToppingsGrid({
  items,
  selectedCounts,
  lockedCounts,
  onAdd,
  onRemove,
}: {
  items: Topping[];
  selectedCounts: Record<string, number>;
  lockedCounts: Record<string, number>;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {items.map((t) => {
        const count = selectedCounts[t.id] ?? 0;
        const locked = lockedCounts[t.id] ?? 0;
        const active = count > 0;
        const canRemove = count > locked;
        return (
          <div
            key={t.id}
            className={clsx(
              "relative rounded-2xl p-4 text-right border-2 transition-all bg-white",
              active
                ? "border-brand-500 bg-brand-50 shadow-glow"
                : "border-ink-100 hover:border-brand-300",
            )}>
            <div className="flex items-start justify-between gap-2">
              <span className="font-bold text-sm">{t.name}</span>
              <span className="inline-flex items-center gap-1">
                {locked > 0 && (
                  <span className="chip !bg-amber-50 !text-amber-700 text-[10px]">
                    ثابت
                  </span>
                )}
                <span
                  className={clsx(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs transition font-bold",
                    active
                      ? "bg-brand-500 text-white"
                      : "bg-ink-100 text-ink-500",
                  )}>
                  {count.toLocaleString("fa-IR")}
                </span>
              </span>
            </div>
            <div className="mt-3 price text-brand-600 text-sm">
              + {formatPrice(t.price)}{" "}
              <span className="text-[10px] font-medium text-ink-400">
                تومان
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => onAdd(t.id)}
                className="btn-outline !py-1.5 !px-2 text-xs">
                <Plus size={14} /> افزودن
              </button>
              <button
                type="button"
                onClick={() => onRemove(t.id)}
                disabled={!canRemove}
                className="btn-ghost !py-1.5 !px-2 text-xs disabled:opacity-40 disabled:cursor-not-allowed">
                <Minus size={14} /> کم
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ReviewStep({
  sandwich,
  title,
  allCounts,
  fixedCounts,
  extraCounts,
  qty,
  setQty,
  onRemoveTopping,
}: {
  sandwich: Sandwich;
  title?: string;
  allCounts: Record<string, number>;
  fixedCounts: Record<string, number>;
  extraCounts: Record<string, number>;
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
          <h3 className="text-2xl font-black">{title ?? sandwich.name}</h3>
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
          {Object.keys(allCounts).length === 0 ? (
            <p className="text-sm text-ink-400">هیچ افزودنی انتخاب نشده است.</p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {Object.entries(allCounts).map(([id, count]) => {
                const t = getTopping(id);
                if (!t) return null;
                const fixed = fixedCounts[id] ?? 0;
                const removable = extraCounts[id] ?? 0;
                return (
                  <li
                    key={id}
                    className="flex items-center justify-between py-2 text-sm">
                    <span>
                      {t.name} × {count.toLocaleString("fa-IR")}
                      {fixed > 0 && (
                        <span className="text-xs text-ink-400 mr-2">
                          (پایه: {fixed.toLocaleString("fa-IR")})
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-brand-600 font-bold tabular">
                        +{formatPrice(t.price * count)}
                      </span>
                      <button
                        onClick={() => onRemoveTopping(id)}
                        disabled={removable <= 0}
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
  title,
  toppings,
  qty,
  total,
  canSubmit,
  onSubmit,
}: {
  sandwich?: Sandwich;
  title?: string;
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
                  alt={title ?? sandwich.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div>
                <div className="font-bold text-sm">{title ?? sandwich.name}</div>
                <div className="text-xs text-ink-500 tabular mt-1">
                  پایه: {formatPrice(sandwich.basePrice)} تومان
                </div>
              </div>
            </div>

            {toppings.length > 0 && (
              <div className="border-t border-ink-100 pt-3 space-y-1.5 max-h-48 overflow-y-auto">
                {Object.entries(countById(toppings)).map(([id, count]) => {
                  const t = getTopping(id);
                  if (!t) return null;
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between text-xs">
                      <span className="text-ink-700">
                        {t.name} × {count.toLocaleString("fa-IR")}
                      </span>
                      <span className="tabular text-brand-600 font-bold">
                        +{formatPrice(t.price * count)}
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
              <span className="price text-2xl text-brand-700">
                {formatPrice(total)}{" "}
                <span className="text-xs font-medium text-ink-500">تومان</span>
              </span>
            </div>

            <button
              onClick={onSubmit}
              disabled={!canSubmit}
              className="btn-primary w-full">
              افزودن به سبد <ArrowLeft size={16} />
            </button>
          </>
        ) : toppings.length > 0 ? (
          <>
            <div>
              <div className="font-bold text-sm">{title ?? "ساندویچ سفارشی"}</div>
              <div className="text-xs text-ink-500 mt-1">بدون پایه منو</div>
            </div>

            <div className="border-t border-ink-100 pt-3 space-y-1.5 max-h-48 overflow-y-auto">
              {Object.entries(countById(toppings)).map(([id, count]) => {
                const t = getTopping(id);
                if (!t) return null;
                return (
                  <div
                    key={id}
                    className="flex items-center justify-between text-xs">
                    <span className="text-ink-700">
                      {t.name} × {count.toLocaleString("fa-IR")}
                    </span>
                    <span className="tabular text-brand-600 font-bold">
                      +{formatPrice(t.price * count)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-ink-100 pt-3 flex items-center justify-between text-sm">
              <span>تعداد</span>
              <span className="font-bold tabular">{qty}</span>
            </div>

            <div className="border-t border-ink-100 pt-3 flex items-center justify-between">
              <span className="text-sm">جمع کل</span>
              <span className="price text-2xl text-brand-700">
                {formatPrice(total)}{" "}
                <span className="text-xs font-medium text-ink-500">تومان</span>
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
          <p className="text-sm text-ink-500">ابتدا یک ساندویچ پایه انتخاب کنید.</p>
        )}
      </div>
    </div>
  );
}
