import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ChefHat, Clock, Sparkles, Star } from "lucide-react";
import { SANDWICHES, formatPrice } from "@/lib/menu";
import SandwichCard from "@/components/SandwichCard";

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-bl from-brand-500 via-brand-400 to-brand-600" />
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,white_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="container-x relative grid md:grid-cols-2 gap-10 py-14 md:py-24 items-center">
          <div className="text-white space-y-6 text-center md:text-right">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-sm font-medium backdrop-blur">
              <Sparkles size={16} /> ساندویچ به سبک خودت
            </span>
            <h1 className="heading text-4xl sm:text-5xl md:text-6xl font-black leading-[1.15]">
              یک گاز بزن،
              <br />
              <span className="text-brand-950">عاشقش می‌شی.</span>
            </h1>
            <p className="text-white/90 text-base sm:text-lg max-w-lg md:mx-0 mx-auto leading-8">
              چامپ؛ تجربه‌ای متفاوت از ساندویچ میکس. مواد اولیه‌ی روزانه، نان
              تازه و امکان شخصی‌سازی کامل قدم‌ به‌ قدم — درست مثل ساب‌وی، اما
              خوش‌مزه‌تر.
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Link
                href="/build"
                className="btn bg-white text-brand-600 hover:bg-brand-50">
                ساندویچ خودت رو بساز <ArrowLeft size={18} />
              </Link>
              <Link
                href="/menu"
                className="btn bg-white/10 text-white hover:bg-white/20 backdrop-blur">
                مشاهده منو
              </Link>
            </div>
            <div className="flex flex-wrap items-center gap-5 pt-4 text-sm text-white/90 justify-center md:justify-start">
              <div className="flex items-center gap-1">
                <Star size={16} className="fill-yellow-300 text-yellow-300" />
                ۴.۹ از ۲٬۰۰۰+ نظر
              </div>
              <div className="flex items-center gap-1">
                <Clock size={16} /> ارسال در ۳۰ دقیقه
              </div>
              <div className="flex items-center gap-1">
                <ChefHat size={16} /> آشپزخانه‌ی باز
              </div>
            </div>
          </div>

          <div className="relative animate-floaty mx-auto w-full max-w-md md:max-w-none">
            <div className="absolute -inset-6 rounded-full bg-white/20 blur-3xl" />
            <div className="relative aspect-square rounded-[2rem] overflow-hidden shadow-2xl ring-8 ring-white/20">
              <Image
                src="https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=1200&q=80"
                alt="ساندویچ ویژه چاپ"
                fill
                priority
                sizes="(max-width:768px) 90vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-3 sm:-right-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 max-w-[80%]">
              <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold">
                ★
              </div>
              <div>
                <div className="text-xs text-ink-500">پرفروش‌ترین آیتم</div>
                <div className="font-bold text-sm">رست بیف چاپ</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* USP STRIP */}
      <section className="container-x -mt-6 md:-mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 bg-white rounded-3xl shadow-card p-4 sm:p-6">
          {[
            { t: "مواد اولیه‌ی روزانه", d: "بدون فریزر و افزودنی" },
            { t: "شخصی‌سازی کامل", d: "۳۰+ افزودنی به انتخاب شما" },
            { t: "ارسال سریع", d: "میانگین ۳۰ دقیقه" },
            { t: "کیفیت رستورانی", d: "آشپزی توسط شف حرفه‌ای" },
          ].map((u, i) => (
            <div key={i} className="text-center sm:text-right">
              <div className="font-bold text-sm sm:text-base">{u.t}</div>
              <div className="text-xs text-ink-500 mt-1">{u.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED MENU */}
      <section className="container-x py-16 md:py-24">
        <div className="flex items-end justify-between mb-8 md:mb-12 flex-wrap gap-4">
          <div>
            <span className="chip mb-3">۴ ساندویچ امضایی</span>
            <h2 className="heading text-3xl md:text-4xl font-black">
              ستاره‌های منوی ما
            </h2>
            <p className="text-ink-500 mt-3 max-w-xl leading-7">
              چهار ساندویچ خاص که هر کدام داستان خودش رو داره. می‌تونی هرکدوم رو
              کاملاً به سلیقه‌ی خودت سفارشی کنی.
            </p>
          </div>
          <Link href="/menu" className="btn-outline !py-2 !px-4 text-sm">
            مشاهده منوی کامل <ArrowLeft size={16} />
          </Link>
        </div>
        <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {SANDWICHES.map((s) => (
            <SandwichCard key={s.id} s={s} />
          ))}
        </div>
      </section>

      {/* BUILD CTA */}
      <section className="container-x pb-16 md:pb-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink-900 text-white p-8 md:p-16 grid md:grid-cols-2 gap-10 items-center">
          <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-brand-500/30 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-brand-500/20 blur-3xl" />
          <div className="relative space-y-5 text-center md:text-right">
            <span className="chip">تجربه‌ی منحصربه‌فرد</span>
            <h2 className="heading text-3xl md:text-5xl font-black leading-tight">
              ساندویچ خودت رو
              <br /> قدم به قدم بساز
            </h2>
            <p className="text-ink-300 leading-8 max-w-md md:mx-0 mx-auto">
              یک ساندویچ پایه انتخاب کن، پروتئین اضافه بزن، پنیر و سس و سبزیجات
              مورد علاقه‌ات رو انتخاب کن — همه‌چیز در یک فلوی ساده و لذت‌بخش.
            </p>
            <Link href="/build" className="btn-primary mt-4">
              شروع ساخت ساندویچ <ArrowLeft size={18} />
            </Link>
          </div>
          <div className="relative grid grid-cols-2 gap-3 sm:gap-4">
            {[
              { n: "۱", t: "پایه" },
              { n: "۲", t: "پروتئین" },
              { n: "۳", t: "پنیر و سبزیجات" },
              { n: "۴", t: "سس‌ها" },
            ].map((step) => (
              <div
                key={step.n}
                className="rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-5">
                <div className="text-3xl font-black text-brand-400 tabular">
                  {step.n}
                </div>
                <div className="mt-2 font-bold">{step.t}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StructuredData />
    </>
  );
}

function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: "Chomp Sandwich",
    servesCuisine: "Sandwich",
    priceRange: "$$",
    image: "/og.jpg",
    address: { "@type": "PostalAddress", addressCountry: "IR" },
    hasMenu: {
      "@type": "Menu",
      hasMenuSection: {
        "@type": "MenuSection",
        name: "ساندویچ‌ها",
        hasMenuItem: SANDWICHES.map((s) => ({
          "@type": "MenuItem",
          name: s.name,
          description: s.description,
          offers: {
            "@type": "Offer",
            price: s.basePrice,
            priceCurrency: "IRT",
          },
        })),
      },
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
