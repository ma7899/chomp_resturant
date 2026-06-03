"use client";

import { Card, DeleteButton, PageHeader } from "@/components/admin/AdminUI";
import { useData } from "@/lib/store";
import { Star } from "lucide-react";

export default function ReviewsAdmin() {
  const reviews = useData((s) => s.reviews);
  const sandwiches = useData((s) => s.sandwiches);
  const toppings = useData((s) => s.toppings);
  const remove = useData((s) => s.deleteReview);

  const labelFor = (r: (typeof reviews)[number]) => {
    if (r.itemType === "sandwich") {
      const s = sandwiches.find((x) => x.slug === r.itemId);
      return s?.name ?? r.itemId;
    }
    const t = toppings.find((x) => x.id === r.itemId);
    return t?.name ?? r.itemId;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="نظرات مشتریان"
        subtitle="مشاهده و مدیریت (حذف) نظرات ثبت‌شده توسط کاربران."
      />

      <div className="space-y-3">
        {reviews.length === 0 && (
          <Card className="text-center text-ink-400 py-12">
            هنوز نظری ثبت نشده است.
          </Card>
        )}
        {reviews.map((r) => (
          <Card key={r.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold">{r.author}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
                    {r.itemType === "sandwich" ? "ساندویچ" : "افزودنی"}
                  </span>
                  <span className="text-xs text-ink-500">
                    روی <span className="font-medium">{labelFor(r)}</span>
                  </span>
                </div>
                <div className="flex items-center gap-0.5 mt-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      size={14}
                      className={
                        n <= r.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-ink-200"
                      }
                    />
                  ))}
                </div>
                <p className="text-sm text-ink-700 mt-2 leading-7">
                  {r.comment}
                </p>
                <p className="text-[10px] text-ink-400 mt-2 tabular">
                  {new Date(r.date).toLocaleString("fa-IR")}
                </p>
              </div>
              <DeleteButton onConfirm={() => remove(r.id)} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
