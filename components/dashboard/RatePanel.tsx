"use client";

import { useState, useTransition } from "react";
import { Star, Loader2, Check, Trash2, Pencil } from "lucide-react";
import {
  deleteSandwichRatingAction,
  rateSandwichAction,
} from "@/app/community/actions";

type Rateable = {
  orderId: string;
  orderNumber: number;
  sandwichType: "menu" | "custom";
  customSandwichId?: string;
  sandwichSlug?: string;
  name: string;
  currentRating: number | null;
  currentReview: string | null;
};

export default function RatePanel({ items }: { items: Rateable[] }) {
  const [list, setList] = useState(items);

  if (list.length === 0) return null;

  return (
    <div className="rounded-3xl bg-white border border-ink-100 p-5">
      <h2 className="font-bold mb-1">به ساندویچ‌هایت امتیاز بده</h2>
      <p className="text-sm text-ink-500 mb-4">
        از سفارش‌های تحویل‌شده، تجربه‌ات را با دیگران به اشتراک بگذار.
      </p>
      <div className="space-y-3">
        {list.map((it) => (
          <RateRow
            key={`${it.orderId}:${it.customSandwichId || it.sandwichSlug}`}
            item={it}
            onDone={() =>
              setList((prev) =>
                prev.filter(
                  (x) =>
                    !(
                      x.orderId === it.orderId &&
                      ((it.customSandwichId &&
                        x.customSandwichId === it.customSandwichId) ||
                        (it.sandwichSlug && x.sandwichSlug === it.sandwichSlug))
                    ),
                ),
              )
            }
          />
        ))}
      </div>
    </div>
  );
}

function RateRow({ item, onDone }: { item: Rateable; onDone: () => void }) {
  const [rating, setRating] = useState(item.currentRating ?? 0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState(item.currentReview ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(item.currentRating == null);
  const [pending, startTransition] = useTransition();

  function submit() {
    if (rating < 1) {
      setError("لطفاً ستاره انتخاب کنید.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const r = await rateSandwichAction({
        customSandwichId: item.customSandwichId,
        menuSandwichSlug: item.sandwichSlug,
        orderId: item.orderId,
        rating,
        review: review || null,
      });
      if (r.ok) {
        setSaved(true);
        setEditing(false);
        setTimeout(() => setSaved(false), 1200);
      } else {
        setError(r.error);
      }
    });
  }

  function remove() {
    setError(null);
    startTransition(async () => {
      const r = await deleteSandwichRatingAction({
        customSandwichId: item.customSandwichId,
        menuSandwichSlug: item.sandwichSlug,
        orderId: item.orderId,
      });
      if (!r.ok) {
        setError(r.error);
        return;
      }
      onDone();
    });
  }

  return (
    <div className="rounded-2xl border border-ink-100 p-4">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm">{item.name}</span>
        <span className="text-xs text-ink-400 tabular">
          سفارش #{item.orderNumber.toLocaleString("fa-IR")}
        </span>
      </div>
      {saved ? (
        <div className="mt-2 text-sm text-green-600 font-semibold inline-flex items-center gap-1">
          <Check size={16} /> امتیاز ثبت شد
        </div>
      ) : (
        <>
          {!editing && item.currentRating != null && (
            <div className="mt-2 flex items-center justify-between">
              <div className="inline-flex items-center gap-1 text-sm text-ink-600">
                <Star size={16} className="fill-amber-400 text-amber-400" />
                امتیاز شما: {item.currentRating.toLocaleString("fa-IR")}
              </div>
              <div className="inline-flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="btn-ghost !py-1.5 !px-2 text-xs">
                  <Pencil size={14} /> ویرایش
                </button>
                <button
                  type="button"
                  onClick={remove}
                  disabled={pending}
                  className="btn-ghost !py-1.5 !px-2 text-xs text-red-600 hover:text-red-700">
                  <Trash2 size={14} /> حذف
                </button>
              </div>
            </div>
          )}

          {editing && (
            <>
              <div className="flex items-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    aria-label={`${n} ستاره`}>
                    <Star
                      size={24}
                      className={
                        n <= (hover || rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-ink-200"
                      }
                    />
                  </button>
                ))}
              </div>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={2}
                placeholder="نظرت درباره این ساندویچ (اختیاری)"
                className="mt-3 w-full rounded-xl border border-ink-100 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition"
              />
              {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
              <button
                onClick={submit}
                disabled={pending}
                className="btn-primary !py-2 !px-4 text-sm mt-2">
                {pending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : item.currentRating == null ? (
                  "ثبت امتیاز"
                ) : (
                  "ذخیره تغییرات"
                )}
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
