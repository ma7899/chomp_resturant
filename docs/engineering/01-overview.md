# 01. Project Overview

## English | فارسی

<details open>
<summary>English</summary>

## Beginner Mode

### Purpose

Chomp is a Persian-first sandwich ordering platform built on Next.js App Router. It combines:

- Menu browsing
- Custom sandwich builder
- Checkout and order creation
- Customer dashboard (addresses, allergies, referrals, orders)
- Community recipes and ratings
- Admin tools (mixed DB-backed + legacy client-state modules)

### Business Goals

- Increase digital ordering conversion and repeat purchase
- Personalize orders through builder + saved recipes
- Create growth loop via referral system
- Enable operator insights with admin reporting and exports

### Main Features

- Phone OTP authentication with role-based access control
- Dynamic customer dashboard with force-dynamic rendering
- Custom sandwich publish/rate flow with purchase gating
- Admin discount/category/combo/customer/report management
- CSV export for reporting

### Technology Stack

| Layer        | Technologies                                              |
| ------------ | --------------------------------------------------------- |
| Frontend     | Next.js 14, React 18, TypeScript, Tailwind, framer-motion |
| Backend      | Next.js route handlers + server actions                   |
| Auth         | Auth.js (NextAuth v5 beta), Credentials OTP mode          |
| Data         | PostgreSQL (Neon), Prisma ORM                             |
| Validation   | Zod                                                       |
| Client State | Zustand                                                   |
| Ops          | Vercel-ready scripts, Prisma migrations/seeding           |

### Repository Structure (High-level)

- `app/`: App Router pages, layouts, API routes, server actions
- `components/`: Reusable UI and domain feature components
- `lib/`: business logic, repositories, stores, auth, validation, utilities
- `prisma/`: schema, migrations, seed entrypoint
- `docs/`: architecture + API + engineering docs

### Screenshot Placeholders

- `[Screenshot Placeholder] Home page and global nav`
- `[Screenshot Placeholder] Build flow stepper and cart drawer`
- `[Screenshot Placeholder] Dashboard overview and order history`
- `[Screenshot Placeholder] Admin reports and CSV export`

### Common Mistakes (New Team Members)

- Trusting client prices: checkout always recomputes prices server-side
- Forgetting role checks in admin server actions
- Importing client-only formatting helpers on server (`lib/menu.ts`)
- Assuming all admin pages are DB-backed (some still use `lib/store.ts`)

## Expert Mode

### Project Philosophy

- Security-first server truth (auth, pricing, discount, allergy enforcement)
- Progressive modernization (legacy Zustand admin coexists with DB-backed modules)
- Persian UX-first (RTL, locale formatting, phone normalization)
- Low-friction extensibility (feature modules in `lib/server`, validations in `lib/validation`)

### Production-Critical Capabilities

- OTP throttling + hashed one-time codes
- Middleware route guard + role-gated admin area
- Deterministic recipe hashing for custom-sandwich dedupe
- Relational model for orders, discounts, referrals, and ratings

### Major Risks

- Partial migration state (admin mixed persistence)
- No automated tests by default
- Operational visibility gaps (error tracking/observability not yet integrated)

</details>

<details>
<summary>فارسی</summary>

## Beginner Mode

### هدف پروژه

چامپ یک پلتفرم سفارش ساندویچ فارسی‌محور است که با Next.js App Router ساخته شده و شامل این بخش‌هاست:

- مشاهده منو
- سازنده ساندویچ سفارشی
- ثبت سفارش و پرداخت
- داشبورد کاربر (آدرس، حساسیت، سفارش‌ها، معرفی)
- مارکت ساندویچ‌های سفارشی و امتیازدهی
- پنل ادمین (ترکیبی از ماژول‌های DB-backed و Legacy)

### اهداف کسب‌وکار

- افزایش نرخ تبدیل سفارش آنلاین و خرید مجدد
- شخصی‌سازی سفارش با Builder و ذخیره دستورها
- رشد ارگانیک با سیستم Referral
- گزارش‌گیری عملیاتی برای مدیریت

### قابلیت‌های اصلی

- احراز هویت OTP بر پایه شماره موبایل و کنترل نقش‌ها
- داشبورد کاربر با رندر پویا
- انتشار/امتیازدهی ساندویچ سفارشی با شرط خرید
- مدیریت تخفیف/دسته‌بندی/کمبو/مشتری/گزارش در ادمین
- خروجی CSV برای گزارش‌ها

### پشته فناوری

| لایه         | فناوری                                                    |
| ------------ | --------------------------------------------------------- |
| فرانت‌اند    | Next.js 14, React 18, TypeScript, Tailwind, framer-motion |
| بک‌اند       | Route Handler و Server Action در Next.js                  |
| احراز هویت   | Auth.js (NextAuth v5 beta), Credentials OTP               |
| داده         | PostgreSQL (Neon), Prisma                                 |
| اعتبارسنجی   | Zod                                                       |
| استیت کلاینت | Zustand                                                   |
| عملیات       | اسکریپت‌های Vercel-ready، مایگریشن و Seed Prisma          |

### ساختار کلی ریپو

- `app/`: صفحات، layoutها، APIها، server actionها
- `components/`: کامپوننت‌های UI و فیچرها
- `lib/`: منطق دامنه، ریپازیتوری‌ها، استورها، auth، validation، utility
- `prisma/`: schema، migration، seed
- `docs/`: مستندات معماری و مهندسی

### جای‌خالی اسکرین‌شات

- `[Screenshot Placeholder] صفحه اصلی و ناوبری`
- `[Screenshot Placeholder] Build Flow و Cart Drawer`
- `[Screenshot Placeholder] داشبورد کاربر و تاریخچه سفارش`
- `[Screenshot Placeholder] گزارش‌های ادمین و CSV Export`

### اشتباهات رایج

- اعتماد به قیمت کلاینتی: قیمت نهایی همیشه سمت سرور محاسبه می‌شود
- فراموش‌کردن Role Check در اکشن‌های ادمین
- استفاده از helper کلاینتی در سرور (`lib/menu.ts`)
- تصور DB-backed بودن همه صفحات ادمین (بخشی هنوز Legacy است)

## Expert Mode

### فلسفه فنی پروژه

- حقیقت نهایی سمت سرور (امنیت، قیمت، تخفیف، حساسیت)
- مدرن‌سازی تدریجی (همزیستی ماژول‌های Legacy با DB-backed)
- اولویت تجربه فارسی و RTL
- توسعه‌پذیری کم‌هزینه (تفکیک `lib/server` و `lib/validation`)

### قابلیت‌های حساس برای Production

- محدودسازی OTP + ذخیره هش‌شده
- گارد مسیرها در middleware + کنترل نقش ادمین
- هش پایدار دستور برای جلوگیری از recipe تکراری
- مدل رابطه‌ای قوی برای سفارش/تخفیف/معرفی/امتیاز

### ریسک‌های اصلی

- وضعیت مهاجرت ناقص پنل ادمین
- نبود تست خودکار
- خلأ در مشاهده‌پذیری عملیاتی (Monitoring/Error Tracking)

</details>
