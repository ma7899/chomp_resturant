import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChefHat, Plus, Star } from "lucide-react";
import { formatPrice, formatDateFa } from "@/lib/format";
import { prisma } from "@/lib/db";
import { getMenuSandwichReviews } from "@/lib/server/ratings";

export const dynamic = "force-dynamic";

export default async function SandwichDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params.slug;

  const [s, { reviews, averageRating, totalRatings }] = await Promise.all([
    prisma.sandwich.findUnique({ where: { slug }, include: { tags: true } }),
    getMenuSandwichReviews(slug),
  ]);

  if (!s) notFound();

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

          {totalRatings > 0 && (
            <div className="inline-flex items-center gap-1.5 text-sm text-amber-600 font-semibold">
              <Star size={16} className="fill-amber-400 text-amber-400" />
              {averageRating.toFixed(1)}
              <span className="text-ink-400 font-normal">
                ({totalRatings.toLocaleString("fa-IR")} نظر)
              </span>
            </div>
          )}

          <p className="text-ink-600 leading-8 text-[15px]">{s.description}</p>

          {s.tags.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-ink-500 mb-2">برچسب‌ها</h3>
              <div className="flex flex-wrap gap-2">
                {s.tags.map((t) => (
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

      {/* Reviews section — read-only; users rate from My Orders after delivery */}
      <section className="mt-12">
        <header className="flex items-end justify-between flex-wrap gap-3 mb-6">
          <div>
            <h2 className="heading text-2xl font-black">نظرات مشتریان</h2>
            <p className="text-sm text-ink-500 mt-1">
              {totalRatings > 0
                ? `${totalRatings.toLocaleString("fa-IR")} امتیاز — میانگین ${averageRating.toFixed(1)} از ۵`
                : "هنوز نظری ثبت نشده. پس از دریافت سفارش از «سفارش‌های من» نظر بده!"}
            </p>
          </div>
          {totalRatings > 0 && (
            <div className="inline-flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  size={16}
                  className={
                    n <= Math.round(averageRating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-ink-200 fill-ink-200"
                  }
                />
              ))}
            </div>
          )}
        </header>

        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-200 p-8 text-center text-ink-400">
            فعلاً نظری ثبت نشده است. پس از دریافت سفارش از بخش «سفارش‌های من»
            نظر بدهید.
          </div>
        ) : (
          <ul className="space-y-4">
            {reviews.map((r) => (
              <li
                key={r.id}
                className="rounded-2xl bg-white border border-ink-100 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                      {(r.user.name || "؟").slice(0, 1)}
                    </span>
                    <div>
                      <div className="font-bold text-sm">
                        {r.user.name || "کاربر"}
                      </div>
                      <div className="text-[11px] text-ink-400 tabular">
                        {formatDateFa(r.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        size={14}
                        className={
                          n <= r.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-ink-200 fill-ink-200"
                        }
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-ink-700 mt-3 leading-7">
                  {r.review}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
