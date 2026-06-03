"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { ArrowLeft, ChefHat, Plus, Star } from "lucide-react";
import { formatPrice, useSandwiches, useTags } from "@/lib/menu";
import ItemReviews from "@/components/ItemReviews";
import { useMemo } from "react";

export default function SandwichDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug as string;
  const sandwiches = useSandwiches();
  const tags = useTags();

  const s = useMemo(
    () => sandwiches.find((x) => x.slug === slug),
    [sandwiches, slug],
  );

  if (sandwiches.length > 0 && !s) {
    // Render a not-found state without breaking SSR (component is client).
    return (
      <div className="container-x py-20 text-center">
        <h1 className="heading text-2xl font-black">آیتم پیدا نشد</h1>
        <Link href="/menu" className="btn-primary mt-6 inline-flex">
          بازگشت به منو
        </Link>
      </div>
    );
  }

  if (!s) return null;

  const itemTags = tags.filter((t) => s.tagIds.includes(t.id));

  return (
    <div className="container-x py-10 md:py-16">
      <nav className="text-xs text-ink-500 mb-6 flex items-center gap-2">
        <Link href="/" className="hover:text-brand-600">خانه</Link>
        <span>›</span>
        <Link href="/menu" className="hover:text-brand-600">منو</Link>
        <span>›</span>
        <span className="text-ink-700">{s.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10 items-start">
        <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-card bg-brand-50">
          <Image
            src={s.image}
            alt={s.name}
            fill
            priority
            sizes="(max-width:1024px) 100vw, 50vw"
            className="object-cover"
          />
          {s.badge && (
            <span className="absolute top-4 right-4 chip !bg-brand-500 !text-white shadow">
              {s.badge}
            </span>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <span className="chip mb-3">ساندویچ امضایی</span>
            <h1 className="heading text-3xl md:text-5xl font-black">
              {s.name}
            </h1>
            <p className="text-brand-600 font-medium mt-2">{s.tagline}</p>
          </div>

          <p className="text-ink-600 leading-8 text-[15px]">{s.description}</p>

          {itemTags.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-ink-500 mb-2">برچسب‌ها</h3>
              <div className="flex flex-wrap gap-2">
                {itemTags.map((t) => (
                  <span
                    key={t.id}
                    className="px-3 py-1 text-xs font-medium rounded-full bg-brand-50 text-brand-700 border border-brand-100">
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-xs font-bold text-ink-500 mb-2 flex items-center gap-1.5">
              <ChefHat size={14} /> مواد تشکیل‌دهنده
            </h3>
            <ul className="grid grid-cols-2 gap-2">
              {s.includedIngredients.map((ing, i) => (
                <li
                  key={i}
                  className="text-sm text-ink-700 bg-white border border-ink-100 rounded-xl px-3 py-2">
                  • {ing}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl bg-white border border-ink-100 p-5 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs text-ink-400">قیمت پایه</div>
              <div className="price text-2xl text-ink-900">
                {formatPrice(s.basePrice)}{" "}
                <span className="text-xs font-medium text-ink-500">تومان</span>
              </div>
            </div>
            <Link
              href={`/build?sandwich=${s.slug}`}
              className="btn-primary !py-2.5 !px-4 text-sm">
              <Plus size={16} /> سفارشی‌سازی
              <ArrowLeft size={16} />
            </Link>
          </div>
        </div>
      </div>

      <ItemReviews itemType="sandwich" itemId={s.slug} />
    </div>
  );
}
