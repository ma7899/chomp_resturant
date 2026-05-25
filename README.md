# Chomp Sandwich

سایت رسمی **چامپ** — ساخته‌شده با Next.js 14 App Router + Tailwind CSS، کاملاً RTL و واکنش‌گرا (mobile-first).

## ویژگی‌ها

- ✅ طراحی RTL/فارسی با فونت Vazirmatn
- ✅ کاملاً Responsive و mobile-first (نوار سفارش چسبیده در پایین موبایل)
- ✅ فلوی شخصی‌سازی ساندویچ به سبک Subway (۶ مرحله)
- ✅ سبد خرید پایدار با Zustand + persist
- ✅ صفحه‌ی Checkout
- ✅ بهینه برای SEO: metadata، JSON-LD Schema.org/Restaurant، sitemap، robots
- ✅ بهینه برای سرعت: next/image + AVIF/WebP، next/font، lazy components، minimal JS
- ✅ انیمیشن‌های ظریف با framer-motion و Tailwind keyframes

## اجرا

```bash
npm install
npm run dev
```

سپس به آدرس http://localhost:3000 بروید.

## ساخت برای production

```bash
npm run build
npm start
```

## ساختار

- `app/` — مسیرها (Home, Menu, Build, Checkout, About, Contact)
- `components/` — Header, Footer, CartDrawer, SandwichCard, BuildFlow, Logo
- `lib/menu.ts` — داده‌ی منو (ساندویچ‌ها، پروتئین، پنیر، سبزیجات، سس)
- `lib/cart.ts` — استور سبد خرید

## جایگزینی عکس‌ها

عکس‌های فعلی از Unsplash به‌صورت placeholder استفاده شده‌اند. برای جایگزینی، آدرس‌های موجود در `lib/menu.ts` (فیلد `image`) و `app/page.tsx` (Hero) را با تصاویر واقعی خود جایگزین کنید. پیشنهاد می‌شود تصاویر را در `public/images/` ذخیره و مسیر را به `/images/...` تغییر دهید.

## لوگو

کامپوننت `components/Logo.tsx` فعلاً متنی است؛ می‌توانید آن را با SVG لوگوی واقعی چاپ جایگزین کنید.
