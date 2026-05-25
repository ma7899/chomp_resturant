import type { Metadata } from "next";
import { Clock, MapPin, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "تماس با ما",
  description: "راه‌های ارتباطی با چامپ",
};

export default function ContactPage() {
  return (
    <div className="container-x py-12 md:py-20 max-w-3xl">
      <span className="chip">تماس با ما</span>
      <h1 className="heading text-3xl md:text-4xl font-black mt-2">
        خوشحال می‌شیم بشنویم
      </h1>
      <p className="text-ink-500 mt-3 leading-7">
        برای سفارش تلفنی، پیشنهاد، انتقاد یا همکاری از طریق راه‌های زیر در تماس
        باشید.
      </p>

      <div className="mt-10 grid sm:grid-cols-3 gap-4">
        {[
          { icon: Phone, t: "تلفن", d: "۰۲۱-۰۰۰۰۰۰۰۰" },
          { icon: MapPin, t: "آدرس", d: "آدرس شعبه" },
          { icon: Clock, t: "ساعت کاری", d: "هر روز ۱۲ تا ۲۴" },
        ].map(({ icon: Icon, t, d }) => (
          <div
            key={t}
            className="rounded-3xl bg-white border border-ink-100 p-5 text-center">
            <Icon size={22} className="mx-auto text-brand-500" />
            <div className="font-bold mt-3">{t}</div>
            <div className="text-sm text-ink-500 mt-1">{d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
