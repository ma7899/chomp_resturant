import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, ShoppingBag, UserRound } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { formatPrice, formatDateFa } from "@/lib/format";
import {
  getPublicCustomSandwichById,
  listPublicCustomSandwiches,
} from "@/lib/server/customSandwiches";
import { getSandwichReviews } from "@/lib/server/ratings";
import CommunityOrderButton from "@/components/community/CommunityOrderButton";

export const dynamic = "force-dynamic";

export default async function CommunityDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireUser(`/community/${params.id}`);

  const sandwich = await getPublicCustomSandwichById(params.id);
  if (!sandwich) notFound();

  const [reviews, related] = await Promise.all([
    getSandwichReviews(sandwich.id),
    listPublicCustomSandwiches({ sort: "top_rated", pageSize: 3 }),
  ]);

  return (
    <div className="container-x py-10 md:py-16 space-y-10">
      <nav className="text-xs text-ink-500 flex items-center gap-2">
        <Link href="/" className="hover:text-brand-600">
          خانه
        </Link>
        <span>›</span>
        <Link href="/community" className="hover:text-brand-600">
          مارکت ساندویچ
        </Link>
        <span>›</span>
        <span className="text-ink-700">{sandwich.name}</span>
      </nav>

      <section className="grid lg:grid-cols-[1fr_360px] gap-6">
        <article className="rounded-3xl bg-white border border-ink-100 p-6 md:p-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-display font-black text-3xl md:text-4xl tracking-tight">
                {sandwich.name}
              </h1>
              <p className="text-sm text-ink-500 mt-2 flex items-center gap-2">
                <UserRound size={14} /> ساخته ی {sandwich.creator.name || "یک مشتری"}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-600">
              <Star size={16} className="fill-amber-400 text-amber-400" />
              {sandwich.averageRating.toFixed(1)}
            </span>
          </div>

          <p className="text-ink-600 mt-5 leading-8 text-[15px]">
            {sandwich.description ||
              "این ساندویچ توسط یکی از مشتریان ساخته و منتشر شده است."}
          </p>

          <div className="mt-6">
            <h2 className="text-sm font-bold text-ink-700 mb-2">مواد تشکیل دهنده</h2>
            <ul className="grid sm:grid-cols-2 gap-2">
              {sandwich.ingredients.map((x) => (
                <li
                  key={x.id}
                  className="rounded-xl border border-ink-100 bg-ink-50/60 px-3 py-2 text-sm text-ink-700">
                  {x.ingredient.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 rounded-2xl bg-ink-50 border border-ink-100 p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-ink-500">قیمت</div>
              <div className="font-black text-xl text-ink-900">
                {formatPrice(sandwich.basePrice)} <span className="text-xs">تومان</span>
              </div>
            </div>
            <div className="w-48">
              <CommunityOrderButton
                sandwich={{
                  id: sandwich.id,
                  name: sandwich.name,
                  baseSlug: sandwich.baseSlug,
                  basePrice: sandwich.basePrice,
                  ingredientIds: sandwich.ingredients.map((x) => x.ingredient.id),
                }}
              />
            </div>
          </div>
        </article>

        <aside className="space-y-3">
          <div className="rounded-3xl bg-white border border-ink-100 p-5">
            <h3 className="font-bold text-sm">آمار</h3>
            <div className="mt-3 text-sm text-ink-600 space-y-2">
              <p>
                <span className="font-semibold text-ink-900">
                  {sandwich.totalOrders.toLocaleString("fa-IR")}
                </span>{" "}
                سفارش
              </p>
              <p>
                <span className="font-semibold text-ink-900">
                  {sandwich.totalRatings.toLocaleString("fa-IR")}
                </span>{" "}
                امتیاز ثبت شده
              </p>
              <p>
                ثبت شده در {formatDateFa(sandwich.createdAt)}
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-white border border-ink-100 p-5">
            <h3 className="font-bold text-sm mb-3">پیشنهادهای مشابه</h3>
            <div className="space-y-2">
              {related.items
                .filter((x) => x.id !== sandwich.id)
                .slice(0, 3)
                .map((r) => (
                  <Link
                    key={r.id}
                    href={`/community/${r.id}`}
                    className="block rounded-xl border border-ink-100 px-3 py-2 text-sm hover:border-brand-300 transition">
                    <div className="font-semibold">{r.name}</div>
                    <div className="text-xs text-ink-500 mt-1 inline-flex items-center gap-1">
                      <ShoppingBag size={12} />
                      {r.totalOrders.toLocaleString("fa-IR")} سفارش
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="rounded-3xl bg-white border border-ink-100 p-6">
        <h2 className="font-display font-black text-2xl">نظرات کاربران</h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-ink-500 mt-3">هنوز نظری ثبت نشده است.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-2xl border border-ink-100 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-sm">{r.user.name || "کاربر"}</p>
                    <p className="text-xs text-ink-400">{formatDateFa(r.createdAt)}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-amber-600 font-bold text-sm">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    {r.rating.toLocaleString("fa-IR")}
                  </span>
                </div>
                <p className="text-sm text-ink-700 mt-2 leading-7">{r.review}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
