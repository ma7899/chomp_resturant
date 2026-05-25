import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "درباره چاپ",
  description: "داستان چامپ؛ از یک رویای کوچک تا تجربه‌ای متفاوت.",
};

export default function AboutPage() {
  return (
    <div className="container-x py-12 md:py-20">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-5 text-center md:text-right">
          <span className="chip">داستان ما</span>
          <h1 className="heading text-3xl md:text-5xl font-black leading-tight">
            ساندویچی که با عشق ساخته می‌شود
          </h1>
          <p className="text-ink-600 leading-8">
            چاپ از یک ایده‌ی ساده شروع شد: یک ساندویچ خوب باید تازه باشه،
            خوش‌مزه باشه، و کاملاً به سلیقه‌ی شما درست بشه. ما هر روز نان رو
            تازه می‌پزیم، گوشت و سبزیجات رو از بهترین تأمین‌کننده‌ها می‌گیریم، و
            یک منوی شفاف بدون افزودنی‌های پنهان ارائه می‌دیم.
          </p>
          <Link href="/build" className="btn-primary">
            تجربه‌ی چاپ رو شروع کن
          </Link>
        </div>
        <div className="relative aspect-square rounded-[2rem] overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1592415486689-125cbbfcbee2?auto=format&fit=crop&w=1200&q=80"
            alt="آشپزخانه چاپ"
            fill
            sizes="(max-width:768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>

      <section className="mt-20 grid sm:grid-cols-3 gap-6">
        {[
          { t: "تازه، هر روز", d: "نان و مواد اولیه روزانه آماده می‌شن." },
          { t: "بدون فریزر", d: "هیچ ماده‌ای از فریزر استفاده نمی‌شه." },
          { t: "شفافیت کامل", d: "همه‌ی مواد رو می‌بینی و انتخاب می‌کنی." },
        ].map((v) => (
          <div
            key={v.t}
            className="rounded-3xl bg-white border border-ink-100 p-6 text-center">
            <div className="font-bold text-lg">{v.t}</div>
            <p className="text-sm text-ink-500 mt-2 leading-7">{v.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
