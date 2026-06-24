# 03. Repository, Modules, Components, Hooks, Utilities

## English | فارسی

<details open>
<summary>English</summary>

## Beginner Mode

### Repository Structure (Detailed)

| Folder                  | Why It Exists                                                     |
| ----------------------- | ----------------------------------------------------------------- |
| `app/`                  | Route entrypoints: pages, layouts, route handlers, server actions |
| `components/`           | Shared UI + feature-level interactive components                  |
| `components/admin/`     | Admin UI primitives and feature managers                          |
| `components/dashboard/` | Customer dashboard interaction components                         |
| `components/community/` | Community marketplace interaction components                      |
| `lib/auth/`             | Auth.js config, providers, session helpers                        |
| `lib/server/`           | Domain repositories and business operations                       |
| `lib/validation/`       | Zod schemas for boundary validation                               |
| `lib/` (root)           | Stores, formatting, db singleton, utilities, shared types         |
| `prisma/`               | DB schema, migration history, seed runner                         |
| `types/`                | App-level type augmentation (e.g., next-auth session typing)      |

### Module Documentation

#### Core Auth Modules

| Module                    | Purpose               | Responsibilities                                   | Used By                                      |
| ------------------------- | --------------------- | -------------------------------------------------- | -------------------------------------------- |
| `lib/auth/auth.config.ts` | Edge-safe auth config | Public route lists, JWT/session callbacks          | `middleware.ts`, `lib/auth/index.ts`         |
| `lib/auth/index.ts`       | Runtime auth provider | Credentials OTP authorize flow                     | `/api/auth/[...nextauth]`, server auth calls |
| `lib/auth/session.ts`     | Auth guards/helpers   | `requireUser`, `requireAdmin`, session/user access | Protected pages/actions                      |
| `lib/auth/client.ts`      | Client auth helpers   | role checks and user session hooks                 | Client components                            |

Extension points:

- Add claims in jwt/session callbacks.
- Add provider modes (only if security reviewed).

Potential issues:

- Edge imports in auth config can break middleware runtime.

#### Domain Service Modules (`lib/server/*`)

| Module                        | Responsibilities                                  | Key Dependencies               | Typical Changes                            |
| ----------------------------- | ------------------------------------------------- | ------------------------------ | ------------------------------------------ |
| `orders.ts`                   | Persist orders, list history, user stats          | Prisma, order schema types     | Add status transitions, receipts, invoices |
| `customSandwiches.ts`         | Save/publish/list custom recipes, ranking, dedupe | Prisma, recipe hash logic      | Update ranking formula, dedupe policy      |
| `ratings.ts`                  | Purchase-gated rating/review CRUD                 | Prisma transactions            | Add moderation/flagging                    |
| `discounts.ts`                | CRUD + discount evaluation                        | Prisma, enums                  | New discount types/stacking policy         |
| `customers.ts`                | Search, profile, analytics, discount assignment   | Prisma aggregations            | Add segmentation metrics                   |
| `reports.ts`                  | Time range resolve, report aggregates, CSV        | Prisma, date logic             | Add KPIs/charts/export formats             |
| `otp.ts`                      | OTP request/verify, throttling, attempt rules     | bcryptjs, sms, phone normalize | Add anti-abuse and lockout policy          |
| `referrals.ts`                | Referral overview/leaderboard                     | Prisma relationships           | Add reward issuance logic                  |
| `addresses.ts`                | Address CRUD with default behavior                | Prisma                         | Geo validation, max address policy         |
| `allergies.ts`                | User allergy preferences and conflict checks      | Prisma                         | Severity levels/warnings                   |
| `catalog.ts`                  | Menu ingredient/sandwich/category fetchers        | Prisma                         | Filters/cache layering                     |
| `combos.ts` / `categories.ts` | Admin DB-backed management                        | Prisma                         | CRUD fields and validation                 |

Common modification pattern:

1. Add/adjust Zod schema in `lib/validation/*`.
2. Update repository function in `lib/server/*`.
3. Expose via server action or API route.
4. Revalidate affected routes.

### Component Documentation

#### Shared Components

| Component         | Purpose                                     | Props/State Notes                          | Anti-pattern to Avoid                          |
| ----------------- | ------------------------------------------- | ------------------------------------------ | ---------------------------------------------- |
| `Header.tsx`      | Global nav, auth/cart triggers              | Client state for mobile/nav scroll         | Coupling business logic into header            |
| `CartDrawer.tsx`  | Cart line management and checkout CTA       | Zustand cart store + body lock hook        | Using cart totals as trusted backend values    |
| `AuthModal.tsx`   | Multi-step OTP auth UX                      | Uses `useAuthModal` state machine          | Duplicating validation logic client-only       |
| `BuildFlow.tsx`   | Sandwich builder steps and cart integration | Base + toppings + custom save flow         | Missing server validation before publish/order |
| `ItemReviews.tsx` | Review display and submit                   | Depends on auth/session and review actions | Client-only moderation assumptions             |

#### Admin Components

| Component                      | Purpose                                               | Reusable Pattern                                             |
| ------------------------------ | ----------------------------------------------------- | ------------------------------------------------------------ |
| `components/admin/AdminUI.tsx` | Primitive design system for admin forms/tables/modals | Use these primitives to keep visual and behavior consistency |
| `DiscountsManager.tsx`         | Discount CRUD UI                                      | Server action + optimistic/error state                       |
| `CategoriesManager.tsx`        | Category CRUD UI                                      | Simple schema-driven forms                                   |
| `CombosManager.tsx`            | Combo management UI                                   | Nested item editing pattern                                  |
| `CustomerTabs.tsx`             | Multi-panel customer detail screen                    | Tabbed data inspection pattern                               |
| `StatusPill.tsx`               | Unified status badge                                  | Enum-to-style mapping                                        |

#### Dashboard Components

| Component            | Purpose                              |
| -------------------- | ------------------------------------ |
| `DashboardNav.tsx`   | Dashboard section navigation         |
| `OrderHistory.tsx`   | Orders list and reorder action       |
| `AddressManager.tsx` | Address CRUD and default selection   |
| `AllergyManager.tsx` | Allergy preference editor            |
| `ReferralShare.tsx`  | Referral code and conversion summary |
| `RatePanel.tsx`      | Post-order custom recipe rating      |

### Hooks

| Hook                        | Purpose                                         | Parameters        | Return | Side Effects                                 |
| --------------------------- | ----------------------------------------------- | ----------------- | ------ | -------------------------------------------- |
| `useBodyScrollLock(active)` | Prevent background scrolling when overlays open | `active: boolean` | `void` | Mutates document/body style during lifecycle |

Example:

```tsx
const open = useCart((s) => s.open);
useBodyScrollLock(open);
```

### Utilities

| Utility                                          | Input          | Output                 | Notes                                     |
| ------------------------------------------------ | -------------- | ---------------------- | ----------------------------------------- |
| `formatPrice(number)` in `lib/format.ts`         | integer amount | localized string       | server/client safe formatter              |
| `formatDateFa(date)`                             | ISO/date       | fa-IR date-time string | locale formatting                         |
| `formatPercent(number)`                          | number         | percent string         | reporting use                             |
| `safeUUID()`                                     | none           | UUID-like string       | fallback for client-created temp entities |
| phone normalize helpers in `lib/server/phone.ts` | raw phone      | normalized local/E.164 | auth and OTP correctness                  |

Edge cases:

- Do not import `lib/menu.ts` formatters in server code (`use client` boundary).
- Phone normalization must handle Persian and Arabic numerals.

## Expert Mode

### Module Ownership Matrix

| Area              | Primary Files                                                                | Coupling Risk | Hardening Recommendation                                        |
| ----------------- | ---------------------------------------------------------------------------- | ------------- | --------------------------------------------------------------- |
| Checkout          | `app/checkout/actions.ts`, `lib/server/orders.ts`                            | High          | Add integration tests for price/discount/allergy matrix         |
| Auth/OTP          | `lib/auth/*`, `lib/server/otp.ts`, `app/api/auth/*`                          | High          | Add abuse monitoring and OTP observability metrics              |
| Community         | `app/community/*`, `lib/server/customSandwiches.ts`, `lib/server/ratings.ts` | Medium        | Extract ranking constants to config and version strategy        |
| Admin mixed state | `app/admin/*`, `lib/store.ts`, `lib/server/*`                                | High          | Complete migration to DB-backed read/write for all admin slices |
| Reporting         | `lib/server/reports.ts`, `/api/admin/reports/export`                         | Medium        | Add pagination/streaming for high-volume export                 |

### Reusable Patterns

- Server actions returning discriminated unions `{ok: true}|{ok:false,error}`.
- Revalidation via `revalidatePath` after mutations.
- Repository-level business constraints instead of page-level conditional sprawl.

### Anti-patterns in Current Codebase

- Split source-of-truth in admin area (legacy Zustand vs Prisma data).
- Heavy client admin pages operating on local store without DB synchronization.
- Missing unified error taxonomy across actions/routes.

</details>

<details>
<summary>فارسی</summary>

## Beginner Mode

### ساختار ریپو (جزئی)

| پوشه                    | دلیل وجود                                               |
| ----------------------- | ------------------------------------------------------- |
| `app/`                  | ورودی مسیرها: page/layout/route/action                  |
| `components/`           | UI مشترک و کامپوننت‌های تعاملی فیچرها                   |
| `components/admin/`     | Primitive و مدیرهای پنل ادمین                           |
| `components/dashboard/` | کامپوننت‌های داشبورد کاربر                              |
| `components/community/` | تعاملات مارکت کامیونیتی                                 |
| `lib/auth/`             | تنظیمات Auth.js، provider، helperهای session            |
| `lib/server/`           | منطق دامنه و عملیات اصلی                                |
| `lib/validation/`       | schemaهای Zod برای اعتبارسنجی مرزها                     |
| `lib/`                  | استورها، formatter، db singleton، utilityها، type مشترک |
| `prisma/`               | schema، migration، seed                                 |
| `types/`                | تایپ‌های افزونه سطح اپلیکیشن                            |

### مستند ماژول‌ها

#### ماژول‌های اصلی احراز هویت

| ماژول                     | هدف                 | مسئولیت                                 | مصرف‌کننده                         |
| ------------------------- | ------------------- | --------------------------------------- | ---------------------------------- |
| `lib/auth/auth.config.ts` | تنظیمات edge-safe   | مسیرهای public، callbackهای jwt/session | middleware و auth runtime          |
| `lib/auth/index.ts`       | provider واقعی auth | authorize برای OTP                      | nextauth route و فراخوانی‌های auth |
| `lib/auth/session.ts`     | گاردهای سروری       | requireUser/requireAdmin                | صفحات و اکشن‌های محافظت‌شده        |
| `lib/auth/client.ts`      | helper کلاینتی      | hookهای session/role                    | کامپوننت‌های کلاینتی               |

#### ماژول‌های دامنه (`lib/server/*`)

| ماژول                           | مسئولیت اصلی                  | تغییرات رایج                 |
| ------------------------------- | ----------------------------- | ---------------------------- |
| `orders.ts`                     | ثبت و خواندن سفارش            | افزودن حالت‌ها یا فاکتور     |
| `customSandwiches.ts`           | ذخیره/انتشار/رتبه‌بندی recipe | تغییر فرمول رتبه‌بندی        |
| `ratings.ts`                    | امتیازدهی خرید-محور           | افزودن moderation            |
| `discounts.ts`                  | مدیریت و ارزیابی تخفیف        | افزودن نوع جدید تخفیف        |
| `customers.ts`                  | پروفایل/تحلیل/تخصیص تخفیف     | افزودن segmentation          |
| `reports.ts`                    | گزارش و CSV                   | KPI جدید یا export فرمت جدید |
| `otp.ts`                        | صدور/تایید OTP و محدودسازی    | سیاست ضدسوءاستفاده           |
| `referrals.ts`                  | گزارش معرفی                   | منطق پاداش                   |
| `addresses.ts` / `allergies.ts` | مدیریت آدرس/حساسیت            | قواعد جدید اعتبارسنجی        |
| `catalog.ts`                    | خواندن منو/مواد               | فیلتر و caching              |

### مستند کامپوننت‌ها

#### کامپوننت‌های مشترک

| کامپوننت          | هدف                   | ضدالگو                              |
| ----------------- | --------------------- | ----------------------------------- |
| `Header.tsx`      | ناوبری سراسری         | قراردادن منطق سنگین دامنه در Header |
| `CartDrawer.tsx`  | مدیریت سبد و CTA خرید | اعتماد به مبلغ کلاینتی              |
| `AuthModal.tsx`   | UX چندمرحله‌ای OTP    | تکرار validation فقط در کلاینت      |
| `BuildFlow.tsx`   | مراحل ساخت ساندویچ    | انتشار/ثبت بدون اعتبارسنجی سروری    |
| `ItemReviews.tsx` | نمایش/ارسال نظر       | فرض moderation فقط کلاینتی          |

#### هوک‌ها

| هوک                 | هدف                 | پارامتر  | خروجی  | اثر جانبی            |
| ------------------- | ------------------- | -------- | ------ | -------------------- |
| `useBodyScrollLock` | قفل اسکرول پس‌زمینه | `active` | `void` | تغییر style روی body |

#### Utilityها

| ابزار           | ورودی     | خروجی       | نکته                    |
| --------------- | --------- | ----------- | ----------------------- |
| `formatPrice`   | عدد       | رشته محلی   | امن برای سرور/کلاینت    |
| `formatDateFa`  | تاریخ     | رشته fa-IR  | گزارش‌ها/نمایش          |
| `formatPercent` | عدد       | درصد        | گزارش                   |
| `safeUUID`      | هیچ       | شناسه موقت  | ایجاد entity سمت کلاینت |
| normalize phone | شماره خام | شماره نرمال | OTP/Auth                |

## Expert Mode

### ماتریس مالکیت ماژول‌ها

| حوزه         | فایل‌های اصلی                                          | ریسک coupling | پیشنهاد                              |
| ------------ | ------------------------------------------------------ | ------------- | ------------------------------------ |
| Checkout     | `app/checkout/actions.ts`, `lib/server/orders.ts`      | بالا          | تست یکپارچه ماتریس قیمت/تخفیف/حساسیت |
| Auth/OTP     | `lib/auth/*`, `lib/server/otp.ts`, `app/api/auth/*`    | بالا          | مانیتورینگ نرخ خطا و سوءاستفاده      |
| Community    | `app/community/*`, `customSandwiches.ts`, `ratings.ts` | متوسط         | نسخه‌بندی فرمول ranking              |
| Admin hybrid | `app/admin/*`, `lib/store.ts`, `lib/server/*`          | بالا          | تکمیل مهاجرت DB-backed               |
| Reporting    | `reports.ts`, export route                             | متوسط         | stream/pagination خروجی‌ها           |

### الگوهای قابل‌استفاده مجدد

- خروجی Union استاندارد برای actionها
- `revalidatePath` پس از mutation
- اعمال قیدهای دامنه در لایه repository

### ضدالگوهای فعلی

- چندمنبعی شدن truth در ادمین
- صفحات کلاینتی ادمین بدون همگام‌سازی کامل با DB
- نبود taxonomy یکپارچه خطا

</details>
