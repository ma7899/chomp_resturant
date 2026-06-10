"use client";

import { useMemo, useState } from "react";
import { Star, StarOff, Trash2 } from "lucide-react";
import { useData } from "@/lib/store";
import { useIsAdmin } from "@/lib/auth/client";
import type { Review } from "@/lib/types";

export default function ItemReviews({
  itemType,
  itemId,
}: {
  itemType: Review["itemType"];
  itemId: string;
}) {
  const all = useData((s) => s.reviews);
  const addReview = useData((s) => s.addReview);
  const deleteReview = useData((s) => s.deleteReview);
  const { isAdmin } = useIsAdmin();
  const isAuthed = isAdmin;

  const reviews = useMemo(
    () =>
      all.filter((r) => r.itemType === itemType && r.itemId === itemId),
    [all, itemType, itemId],
  );

  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const [name, setName] = useState("");
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [comment, setComment] = useState("");
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;
    addReview({
      itemType,
      itemId,
      author: name.trim(),
      rating,
      comment: comment.trim(),
    });
    setName("");
    setComment("");
    setRating(5);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  };

  return (
    <section className="mt-12">
      <header className="flex items-end justify-between flex-wrap gap-3 mb-6">
        <div>
          <h2 className="heading text-2xl font-black">نظرات مشتریان</h2>
          <p className="text-sm text-ink-500 mt-1">
            {reviews.length > 0
              ? `${reviews.length} نظر — میانگین ${avg.toFixed(1)} از ۵`
              : "هنوز نظری ثبت نشده. اولین نفر باشید!"}
          </p>
        </div>
        {reviews.length > 0 && <Stars value={Math.round(avg)} readOnly />}
      </header>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        <ul className="space-y-4">
          {reviews.length === 0 && (
            <li className="rounded-2xl border border-dashed border-ink-200 p-8 text-center text-ink-400">
              فعلاً نظری ثبت نشده است.
            </li>
          )}
          {reviews.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl bg-white border border-ink-100 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                    {r.author.slice(0, 1)}
                  </span>
                  <div>
                    <div className="font-bold text-sm">{r.author}</div>
                    <div className="text-[11px] text-ink-400 tabular">
                      {new Date(r.date).toLocaleDateString("fa-IR")}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Stars value={r.rating} readOnly />
                  {isAuthed && (
                    <button
                      onClick={() => deleteReview(r.id)}
                      className="p-1.5 rounded-lg text-ink-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="حذف نظر (ادمین)">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-ink-700 mt-3 leading-7">
                {r.comment}
              </p>
            </li>
          ))}
        </ul>

        <aside className="rounded-2xl bg-white border border-ink-100 p-5 h-fit lg:sticky lg:top-24">
          <h3 className="font-bold mb-4">نظر خودتان را ثبت کنید</h3>
          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-ink-700">نام شما</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-ink-100 px-3 py-2.5 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                placeholder="مثلاً نازنین"
              />
            </label>
            <div>
              <span className="text-sm font-medium text-ink-700 block mb-2">
                امتیاز شما
              </span>
              <Stars
                value={hover || rating}
                onHover={setHover}
                onChange={(v) => setRating(v as 1 | 2 | 3 | 4 | 5)}
              />
            </div>
            <label className="block">
              <span className="text-sm font-medium text-ink-700">دیدگاه</span>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-ink-100 px-3 py-2.5 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                placeholder="تجربه‌ی خودتان را با ما در میان بگذارید..."
              />
            </label>
            <button type="submit" className="btn-primary w-full !py-2.5 text-sm">
              ثبت نظر
            </button>
            {submitted && (
              <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-center">
                ممنون از نظرت!
              </div>
            )}
          </form>
        </aside>
      </div>
    </section>
  );
}

function Stars({
  value,
  onChange,
  onHover,
  readOnly,
}: {
  value: number;
  onChange?: (n: number) => void;
  onHover?: (n: number) => void;
  readOnly?: boolean;
}) {
  return (
    <div
      className="inline-flex items-center gap-0.5"
      onMouseLeave={() => onHover?.(0)}
      role={readOnly ? undefined : "radiogroup"}>
      {[1, 2, 3, 4, 5].map((n) => {
        const Icon = n <= value ? Star : StarOff;
        return (
          <button
            key={n}
            type="button"
            disabled={readOnly}
            onMouseEnter={() => onHover?.(n)}
            onClick={() => onChange?.(n)}
            className={
              readOnly
                ? "cursor-default"
                : "hover:scale-110 transition disabled:opacity-50"
            }
            aria-label={`${n} ستاره`}>
            <Icon
              size={readOnly ? 16 : 22}
              className={
                n <= value
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-ink-300"
              }
            />
          </button>
        );
      })}
    </div>
  );
}
