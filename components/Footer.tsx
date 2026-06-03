import Link from "next/link";
import { Instagram, Phone, MapPin, Clock } from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="mt-20 bg-ink-900 text-ink-100">
      <div className="container-x py-14 grid gap-10 md:grid-cols-4">
        <div className="space-y-4">
          <Logo className="h-10 w-auto" />
          <p className="text-sm text-ink-300 leading-7">
            چامپ؛ تجربه‌ای متفاوت از ساندویچ میکس با امکان شخصی‌سازی کامل. هر
            روز تازه، هر گاز خاطره‌انگیز.
          </p>
        </div>

        <div>
          <h3 className="font-bold mb-4">دسترسی سریع</h3>
          <ul className="space-y-2 text-sm text-ink-300">
            <li>
              <Link href="/menu" className="hover:text-brand-400">
                منوی کامل
              </Link>
            </li>
            <li>
              <Link href="/build" className="hover:text-brand-400">
                ساخت ساندویچ
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-brand-400">
                درباره چاپ
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-brand-400">
                تماس با ما
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4">تماس</h3>
          <ul className="space-y-3 text-sm text-ink-300">
            <li className="flex items-center gap-2">
              <Phone size={16} className="text-brand-400" /> ۰۹۱۳۴۶۶۷۹۵۹
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={16} className="text-brand-400" />
              اصفهان، شیخ صدوق جنوبی، میدان برج، ساندویچ چامپ
            </li>
            <li className="flex items-center gap-2">
              <Clock size={16} className="text-brand-400" /> هر روز ۱۷ تا ۲۳:۳۰
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4">ما را دنبال کنید</h3>
          <a
            href="#"
            aria-label="Instagram"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-brand-500 transition-colors">
            <Instagram size={18} /> اینستاگرام چاپ
          </a>
          <p className="text-xs text-ink-400 mt-6">
            اگر به ماده غذایی حساسیت دارید، حتماً به ما اطلاع دهید.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x py-5 text-center text-xs text-ink-400">
          © {new Date().getFullYear()} Chomp Sandwich — تمام حقوق محفوظ است.
        </div>
      </div>
    </footer>
  );
}
