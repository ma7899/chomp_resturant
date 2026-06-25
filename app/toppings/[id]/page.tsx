"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { formatPrice, useTags, useToppings } from "@/lib/menu";
import ItemReviews from "@/components/ItemReviews";

const CATEGORY_LABEL: Record<string, string> = {
  protein: "پروتئین",
  cheese: "پنیر",
  veggie: "سبزیجات و افزودنی",
  sauce: "سس",
};

export default function ToppingDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const toppings = useToppings();
  const tags = useTags();

  const t = useMemo(() => toppings.find((x) => x.id === id), [toppings, id]);

  if (toppings.length > 0 && !t) {
    return (
      <div className="container-x py-20 text-center">
        <h1 className="heading text-2xl font-black">افزودنی پیدا نشد</h1>
        <Link href="/menu" className="btn-primary mt-6 inline-flex">
          بازگشت به منو
        </Link>
      </div>
    );
  }
  if (!t) return null;

  const itemTags = tags.filter((x) => t.tagIds.includes(x.id));

  return (
    <div className="container-x py-10 md:py-16">
      <nav className="text-xs text-ink-500 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-brand-600">
          خانه
        </Link>
        <span>›</span>
        <Link href="/menu" className="hover:text-brand-600">
          منو
        </Link>
        <span>›</span>
        <span className="text-ink-700">{t.name}</span>
      </nav>

      <div className="rounded-[2rem] bg-gradient-to-bl from-brand-500 to-brand-600 text-white p-8 md:p-12 shadow-glow">
        <span className="chip !bg-white/20 !text-white">
          {CATEGORY_LABEL[t.category] ?? "افزودنی"}
        </span>
        <h1 className="heading text-3xl md:text-5xl font-black mt-3">
          {t.name}
        </h1>
        <div className="mt-5 flex items-baseline gap-2">
          <span className="text-xs opacity-80">قیمت افزودنی</span>
          <span className="price text-3xl">
            + {formatPrice(t.price)}{" "}
            <span className="text-xs font-medium opacity-90">تومان</span>
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="md:col-span-2 space-y-6">
          {t.description && (
            <div>
              <h3 className="text-xs font-bold text-ink-500 mb-2">توضیحات</h3>
              <p className="text-ink-700 leading-8 text-[15px]">
                {t.description}
              </p>
            </div>
          )}

          {itemTags.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-ink-500 mb-2">برچسب‌ها</h3>
              <div className="flex flex-wrap gap-2">
                {itemTags.map((tg) => (
                  <span
                    key={tg.id}
                    className="px-3 py-1 text-xs font-medium rounded-full bg-brand-50 text-brand-700 border border-brand-100">
                    {tg.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="rounded-3xl bg-white border border-ink-100 p-5 h-fit">
          <h3 className="font-bold mb-3">می‌خوای امتحانش کنی؟</h3>
          <p className="text-xs text-ink-500 mb-4 leading-6">
            این افزودنی را می‌توانید در مرحله‌ی ساخت ساندویچ به انتخابتان اضافه
            کنید.
          </p>
          <Link href="/build" className="btn-primary w-full !py-2.5 text-sm">
            <ShoppingBag size={16} /> ساخت ساندویچ
            <ArrowLeft size={16} />
          </Link>
        </aside>
      </div>

      <ItemReviews itemType="topping" itemId={t.id} />
    </div>
  );
}
