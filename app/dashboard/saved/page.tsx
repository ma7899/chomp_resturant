import Link from "next/link";
import { ChefHat, Globe, Lock, Star, ShoppingBag } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { listUserCustomSandwiches } from "@/lib/server/customSandwiches";
import { formatPrice } from "@/lib/format";
import CommunityOrderButton from "@/components/community/CommunityOrderButton";

export const dynamic = "force-dynamic";

export default async function SavedSandwichesPage() {
  const user = await requireUser("/dashboard/saved");
  const sandwiches = await listUserCustomSandwiches(user.id);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display font-black text-2xl tracking-tight">
          ساندویچ‌های من
        </h1>
        <p className="text-ink-500 mt-1 text-sm leading-7">
          ساندویچ‌هایی که ساخته و ذخیره کرده‌ای. ساندویچ‌های عمومی در مارکت برای
          دیگران قابل سفارش است.
        </p>
      </header>

      {sandwiches.length === 0 ? (
        <div className="rounded-3xl bg-white border border-dashed border-ink-200 p-10 text-center text-ink-400">
          <ChefHat size={40} className="mx-auto mb-3 opacity-40" />
          هنوز ساندویچی ذخیره نکرده‌ای.
          <div className="mt-4">
            <Link href="/build" className="btn-primary inline-flex">
              ساخت ساندویچ
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {sandwiches.map((s) => (
            <article
              key={s.id}
              className="rounded-3xl bg-white border border-ink-100 p-5 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display font-extrabold text-lg tracking-tight">
                  {s.name}
                </h3>
                <span
                  className={`chip text-[10px] ${
                    s.isPublic
                      ? "!bg-green-50 !text-green-700"
                      : "!bg-ink-100 !text-ink-500"
                  }`}>
                  {s.isPublic ? (
                    <>
                      <Globe size={12} /> عمومی
                    </>
                  ) : (
                    <>
                      <Lock size={12} /> خصوصی
                    </>
                  )}
                </span>
              </div>
              <p className="text-sm text-ink-600 mt-2 leading-6 line-clamp-2 flex-1">
                {s.description ||
                  s.ingredients.map((x) => x.ingredient.name).join("، ")}
              </p>
              <div className="flex items-center justify-between mt-3 text-xs text-ink-400">
                <span className="inline-flex items-center gap-1">
                  <ShoppingBag size={13} />
                  {s.totalOrders.toLocaleString("fa-IR")} سفارش
                </span>
                <span className="inline-flex items-center gap-1">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  {s.averageRating.toFixed(1)} (
                  {s.totalRatings.toLocaleString("fa-IR")})
                </span>
                <span className="price text-brand-700">
                  {formatPrice(s.basePrice)} ت
                </span>
              </div>
              <div className="mt-4">
                <CommunityOrderButton
                  sandwich={{
                    id: s.id,
                    name: s.name,
                    baseSlug: s.baseSlug,
                    basePrice: s.basePrice,
                    ingredientIds: s.ingredients.map((x) => x.ingredient.id),
                  }}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
