import Image from "next/image";
import Link from "next/link";
import type { Sandwich } from "@/lib/menu";
import { formatPrice } from "@/lib/menu";
import { ArrowLeft, Plus } from "lucide-react";

export default function SandwichCard({ s }: { s: Sandwich }) {
  return (
    <article className="group relative rounded-3xl overflow-hidden bg-white shadow-card hover:shadow-glow transition-all duration-300 flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden bg-brand-50">
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
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-lg">{s.name}</h3>
        <p className="text-sm text-brand-600 mt-1">{s.tagline}</p>
        <p className="text-xs text-ink-500 mt-3 line-clamp-2 leading-6">
          {s.description}
        </p>
        <div className="mt-auto pt-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-ink-400">از</span>
            <div className="font-bold text-ink-900 tabular">
              {formatPrice(s.basePrice)} <span className="text-xs">تومان</span>
            </div>
          </div>
          <Link
            href={`/build?sandwich=${s.slug}`}
            className="btn-primary !py-2 !px-4 text-sm">
            <Plus size={16} /> سفارشی‌سازی
          </Link>
        </div>
      </div>
    </article>
  );
}
