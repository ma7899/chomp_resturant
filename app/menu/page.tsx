import type { Metadata } from "next";
import SandwichCard from "@/components/SandwichCard";
import {
  CHEESES,
  PROTEINS,
  SANDWICHES,
  SAUCES,
  VEGGIES,
  formatPrice,
  type Topping,
} from "@/lib/menu";

export const metadata: Metadata = {
  title: "منوی کامل",
  description:
    "منوی کامل چامپ: ساندویچ‌های امضایی، پروتئین‌ها، پنیرها، سبزیجات و سس‌های ویژه.",
};

export default function MenuPage() {
  return (
    <div className="container-x py-10 md:py-16">
      <header className="mb-10 text-center md:text-right">
        <span className="chip mb-3">منوی کامل</span>
        <h1 className="heading text-3xl md:text-5xl font-black">منو</h1>
        <p className="text-ink-500 mt-3 max-w-2xl leading-7">
          ساندویچ‌های امضایی ما را ببینید یا با افزودنی‌های دلخواه، ساندویچ
          مخصوص خودتان را بسازید.
        </p>
      </header>

      <section className="mb-16">
        <h2 className="heading text-2xl font-black mb-6">ساندویچ‌ها</h2>
        <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {SANDWICHES.map((s) => (
            <SandwichCard key={s.id} s={s} />
          ))}
        </div>
      </section>

      <ToppingSection
        title="پروتئین‌ها (افزودنی)"
        items={PROTEINS}
        accent="bg-rose-50 text-rose-700"
      />
      <ToppingSection
        title="پنیرها"
        items={CHEESES}
        accent="bg-amber-50 text-amber-700"
      />
      <ToppingSection
        title="سبزیجات و افزودنی‌ها"
        items={VEGGIES}
        accent="bg-emerald-50 text-emerald-700"
      />
      <ToppingSection
        title="سس‌ها"
        items={SAUCES}
        accent="bg-orange-50 text-orange-700"
      />

      <div className="mt-12 rounded-2xl bg-brand-50 border border-brand-100 p-5 text-sm text-brand-800 text-center">
        اگر به ماده‌ی غذایی حساسیت دارید، حتماً هنگام ثبت سفارش به ما اطلاع
        دهید.
      </div>
    </div>
  );
}

function ToppingSection({
  title,
  items,
  accent,
}: {
  title: string;
  items: Topping[];
  accent: string;
}) {
  return (
    <section className="mb-12">
      <h2 className="heading text-2xl font-black mb-5">{title}</h2>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((t) => (
          <div
            key={t.id}
            className="rounded-2xl bg-white border border-ink-100 p-4 flex items-center justify-between hover:border-brand-300 hover:shadow-card transition">
            <div>
              <div className="font-medium">{t.name}</div>
              <span
                className={`text-[10px] mt-1 inline-block px-2 py-0.5 rounded-full ${accent}`}>
                افزودنی
              </span>
            </div>
            <div className="font-bold text-brand-600 tabular text-sm">
              {formatPrice(t.price)}
              <span className="text-[10px] text-ink-400"> T</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
