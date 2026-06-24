import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import {
  listPublicCustomSandwiches,
  getTopCustomSandwiches,
  type CommunitySort,
} from "@/lib/server/customSandwiches";
import { formatPrice } from "@/lib/format";
import { Star, ShoppingBag, Trophy, Search } from "lucide-react";
import CommunityOrderButton from "@/components/community/CommunityOrderButton";

export const dynamic = "force-dynamic";

const SORTS: { id: CommunitySort; label: string }[] = [
  { id: "newest", label: "جدیدترین" },
  { id: "top_orders", label: "پرسفارش ترین" },
  { id: "top_rated", label: "بالاترین امتیاز" },
  { id: "trending", label: "پرطرفدار" },
];

type IngredientLite = { ingredient: { id: string; name: string } };
type CommunityItem = {
  id: string;
  name: string;
  description: string | null;
  baseSlug: string | null;
  basePrice: number;
  averageRating: number;
  totalRatings: number;
  totalOrders: number;
  creator: { name: string | null };
  ingredients: IngredientLite[];
};

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: { q?: string; sort?: string; page?: string };
}) {
  await requireUser("/community");

  const search = searchParams.q?.trim() || undefined;
  const sort = (SORTS.find((s) => s.id === searchParams.sort)?.id ??
    "newest") as CommunitySort;
  const page = Number(searchParams.page) || 1;

  const [top, list] = await Promise.all([
    getTopCustomSandwiches(3),
    listPublicCustomSandwiches({ search, sort, page }),
  ]);

  return (
    <div className="container-x py-8 md:py-12 space-y-10">
      <header>
        <span className="chip">ساندویچ دیگران</span>
        <h1 className="font-display font-black text-3xl md:text-4xl tracking-tight mt-2">
          مارکت ساندویچ های مشتری ها
        </h1>
        <p className="text-ink-500 mt-2 max-w-2xl leading-7">
          ترکیب هایی که خود مشتری ها ساخته اند را کشف کن، امتیازشان را ببین و با
          یک کلیک سفارش بده.
        </p>
      </header>

      {top.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 font-display font-extrabold text-xl mb-4">
            <Trophy size={20} className="text-brand-500" /> ۳ ساندویچ برتر
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {(top as CommunityItem[]).map((s, i) => (
              <div
                key={s.id}
                className="relative rounded-3xl bg-gradient-to-bl from-brand-500 to-brand-600 text-white p-5 overflow-hidden">
                <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-white/10" />
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-black">
                    {(i + 1).toLocaleString("fa-IR")}
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-bold">
                    <Star size={15} className="fill-yellow-300 text-yellow-300" />
                    {s.averageRating.toFixed(1)}
                  </span>
                </div>
                <h3 className="font-display font-black text-lg mt-3">
                  <Link href={`/community/${s.id}`} className="hover:underline">
                    {s.name}
                  </Link>
                </h3>
                <p className="text-white/80 text-xs mt-1 leading-6 line-clamp-2 min-h-[3rem]">
                  {s.description ||
                    s.ingredients.map((x) => x.ingredient.name).join("، ")}
                </p>
                <div className="flex items-center justify-between mt-3 text-xs text-white/90">
                  <span className="inline-flex items-center gap-1">
                    <ShoppingBag size={14} />
                    {s.totalOrders.toLocaleString("fa-IR")} سفارش
                  </span>
                  <span className="tabular">{formatPrice(s.basePrice)} ت</span>
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
                    variant="hero"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <form className="flex flex-col sm:flex-row gap-3" action="/community">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"
            />
            <input
              name="q"
              defaultValue={search}
              placeholder="جستجوی ساندویچ..."
              className="w-full rounded-2xl border border-ink-100 bg-white px-10 py-3 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition"
            />
          </div>
          <input type="hidden" name="sort" value={sort} />
          <button type="submit" className="btn-primary">
            جستجو
          </button>
        </form>

        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {SORTS.map((s) => {
            const params = new URLSearchParams();
            if (search) params.set("q", search);
            params.set("sort", s.id);
            const active = s.id === sort;
            return (
              <Link
                key={s.id}
                href={`/community?${params.toString()}`}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-brand-500 text-white shadow-glow"
                    : "bg-white border border-ink-100 text-ink-600 hover:border-brand-300"
                }`}>
                {s.label}
              </Link>
            );
          })}
        </div>
      </section>

      {list.items.length === 0 ? (
        <div className="rounded-3xl bg-white border border-dashed border-ink-200 p-12 text-center text-ink-400">
          هنوز ساندویچ عمومی ای ثبت نشده است. اولین نفر باش!
          <div className="mt-4">
            <Link href="/build" className="btn-primary inline-flex">
              ساخت ساندویچ
            </Link>
          </div>
        </div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(list.items as CommunityItem[]).map((s) => (
            <article
              key={s.id}
              className="rounded-3xl bg-white border border-ink-100 p-5 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display font-extrabold text-lg tracking-tight">
                  <Link
                    href={`/community/${s.id}`}
                    className="hover:text-brand-600 transition">
                    {s.name}
                  </Link>
                </h3>
                <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-600">
                  <Star size={15} className="fill-amber-400 text-amber-400" />
                  {s.averageRating.toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-ink-500 mt-1">
                ساخته ی {s.creator.name || "یک مشتری"}
              </p>
              <p className="text-sm text-ink-600 mt-3 leading-6 line-clamp-2 flex-1">
                {s.description ||
                  s.ingredients.map((x) => x.ingredient.name).join("، ")}
              </p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-ink-400 inline-flex items-center gap-1">
                  <ShoppingBag size={14} />
                  {s.totalOrders.toLocaleString("fa-IR")} سفارش ·{" "}
                  {s.totalRatings.toLocaleString("fa-IR")} امتیاز
                </span>
                <span className="price text-brand-700">
                  {formatPrice(s.basePrice)}{" "}
                  <span className="text-xs font-medium text-ink-500">ت</span>
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
        </section>
      )}

      {list.pages > 1 && (
        <nav className="flex items-center justify-center gap-2">
          {Array.from({ length: list.pages }, (_, i) => i + 1).map((p) => {
            const params = new URLSearchParams();
            if (search) params.set("q", search);
            params.set("sort", sort);
            params.set("page", String(p));
            return (
              <Link
                key={p}
                href={`/community?${params.toString()}`}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold tabular ${
                  p === list.page
                    ? "bg-brand-500 text-white"
                    : "bg-white border border-ink-100 text-ink-600 hover:border-brand-300"
                }`}>
                {p.toLocaleString("fa-IR")}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
