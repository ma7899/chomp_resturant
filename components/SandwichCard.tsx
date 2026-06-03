import Image from "next/image";
import Link from "next/link";
import type { Sandwich } from "@/lib/menu";
import { formatPrice } from "@/lib/menu";
import { Plus } from "lucide-react";

export default function SandwichCard({ s }: { s: Sandwich }) {
  return (
    <article className="group relative rounded-3xl overflow-hidden bg-white shadow-card hover:shadow-glow transition-all duration-300 flex flex-col">
      <Link
        href={`/menu/${s.slug}`}
        className="relative aspect-[4/3] overflow-hidden bg-brand-50 block"
        aria-label={s.name}>
        <Image
          src={s.image}
          alt={s.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {s.badge && (
          <span className="absolute top-3 right-3 chip !bg-brand-500 !text-white shadow">
            {s.badge}
          </span>
        )}
      </Link>
      <div className="p-5 flex flex-col flex-1">
        <Link href={`/menu/${s.slug}`} className="hover:text-brand-600">
          <h3 className="font-display font-extrabold text-lg tracking-tight">
            {s.name}
          </h3>
        </Link>
        <p className="text-sm font-medium text-brand-600 mt-1">{s.tagline}</p>
        <p className="text-xs text-ink-500 mt-3 line-clamp-2 leading-6">
          {s.description}
        </p>
        <div className="mt-auto pt-5 flex items-center justify-between gap-2">
          <div>
            <span className="text-xs text-ink-400">از</span>
            <div className="price text-lg text-ink-900">
              {formatPrice(s.basePrice)}{" "}
              <span className="text-xs font-medium text-ink-500">تومان</span>
            </div>
          </div>
          <div className="flex gap-1.5">
            <Link
              href={`/menu/${s.slug}`}
              className="btn-ghost !py-2 !px-3 text-xs"
              aria-label="جزئیات">
              جزئیات
            </Link>
            <Link
              href={`/build?sandwich=${s.slug}`}
              className="btn-primary !py-2 !px-3 text-xs">
              <Plus size={14} /> سفارش
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
