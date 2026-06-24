# 06. Developer Tasks, Workflow, Testing, Deployment

## English | فارسی

<details open>
<summary>English</summary>

## Beginner Mode

### Local Setup

1. Install Node.js LTS and npm.
2. Install dependencies: `npm install`.
3. Configure `.env` from `.env.example` with at least `DATABASE_URL` and `AUTH_SECRET`.
4. Generate Prisma client: `npm run db:generate`.
5. Apply DB schema: `npm run db:push` (or migrations: `npm run db:migrate`).
6. Seed initial data: `npm run db:seed`.
7. Start app: `npm run dev`.

### Common Developer Tasks (Step-by-step)

#### Add a New Page

1. Create `app/<route>/page.tsx`.
2. If protected, rely on middleware + call `requireUser` as needed.
3. Add metadata for SEO.
4. Link in nav or relevant section.

#### Add a New Component

1. Create component in `components/<domain>/`.
2. Keep props typed and side effects minimal.
3. Reuse admin/dashboard primitives when possible.
4. Add usage example in docs.

#### Add a New Server Module

1. Create `lib/server/<module>.ts`.
2. Keep it data/domain focused, no UI concerns.
3. Add schema in `lib/validation/<module>.ts`.
4. Expose through server action or API route.

#### Add a New API Endpoint

1. Add `app/api/<domain>/<name>/route.ts`.
2. Parse body safely and validate with Zod.
3. Enforce auth/role.
4. Return stable JSON error codes.

#### Add New DB Table + Migration

1. Update `prisma/schema.prisma`.
2. Run `npm run db:migrate`.
3. Update repository layer and validation.
4. Update seed if needed.

#### Add Auth/Permission/Role

1. Extend role enum in Prisma if needed.
2. Add claim mapping in `auth.config.ts` callbacks.
3. Update middleware route policy.
4. Add `require<role>` helper and enforce server-side.

#### Add Hook/Utility/Style/Env/Feature Flag

- Hook: place in `lib/`, document side effects.
- Utility: keep pure, server-safe by default.
- Style: use Tailwind tokens and existing component patterns.
- Env var: add to `.env.example`, docs, and deployment config.
- Feature flag: add central config source (recommended pending implementation).

### Development Workflow

- Branch naming: `feat/*`, `fix/*`, `chore/*` (recommended).
- PR checklist:
  - Schema and validation aligned
  - Auth checks present
  - Revalidation done for mutated pages
  - Docs updated
- Build before merge: `npm run build`.

### Testing Status

- Current state: no automated test framework configured.
- Minimum manual checklist:
  - OTP login/register
  - Checkout with discount and allergy conditions
  - Dashboard address/allergy changes
  - Admin CRUD paths and report export

## Expert Mode

### Suggested Git Workflow and Release Process

1. Trunk-based with short-lived feature branches.
2. Squash-merge with semantic PR titles.
3. Migration-aware release order:
   - deploy schema first (non-breaking)
   - deploy app code
   - run backfill/cleanup scripts
4. Release note sections:
   - breaking changes
   - db changes
   - endpoint changes
   - operational actions required

### CI/CD Baseline (Recommended)

- CI steps:
  - install
  - typecheck (`npx tsc --noEmit`)
  - lint (`npm run lint`)
  - build (`npm run build`)
- CD steps:
  - `npm run db:deploy`
  - deploy app
  - post-deploy smoke tests

### Deployment Runbook

| Stage      | Command/Action                                       | Validation                       |
| ---------- | ---------------------------------------------------- | -------------------------------- |
| Build      | `npm run build`                                      | no compile/runtime build errors  |
| DB migrate | `npm run db:deploy`                                  | migration completes successfully |
| Start      | `npm start` (or Vercel runtime)                      | app boot and health pages load   |
| Smoke test | login, checkout, report export                       | critical flows pass              |
| Rollback   | redeploy prior version + migration rollback strategy | service restored                 |

### Monitoring and Health Checks

- Add request/error logging for server actions and route handlers.
- Add synthetic checks for:
  - OTP endpoint
  - auth callback
  - checkout action
  - report export endpoint
- Add error tracking platform (Sentry recommended).

### Testing Strategy Roadmap

- Unit tests: `lib/server` pure/domain functions.
- Integration tests: API routes and server actions with test DB.
- E2E tests: login -> build -> checkout -> dashboard -> admin report.
- Coverage targets:
  - Critical business paths: 80%+
  - Non-critical UI: risk-based

</details>

<details>
<summary>فارسی</summary>

## Beginner Mode

### راه‌اندازی محلی

1. نصب Node.js LTS.
2. نصب وابستگی‌ها: `npm install`.
3. تنظیم `.env` براساس `.env.example` (حداقل `DATABASE_URL` و `AUTH_SECRET`).
4. تولید Prisma client: `npm run db:generate`.
5. اعمال schema: `npm run db:push` یا migration: `npm run db:migrate`.
6. seed داده اولیه: `npm run db:seed`.
7. اجرای پروژه: `npm run dev`.

### کارهای رایج توسعه

#### افزودن صفحه جدید

1. ساخت `app/<route>/page.tsx`.
2. اگر محافظت‌شده است، middleware + `requireUser` را رعایت کنید.
3. metadata را اضافه کنید.
4. لینک ناوبری را به‌روزرسانی کنید.

#### افزودن کامپوننت جدید

1. ساخت در `components/<domain>/`.
2. props تایپ‌شده و side effect حداقلی.
3. reuse از primitiveهای admin/dashboard.
4. افزودن نمونه استفاده در docs.

#### افزودن ماژول سروری

1. فایل در `lib/server/<module>.ts`.
2. منطق دامنه بدون وابستگی UI.
3. schema متناظر در `lib/validation`.
4. ارائه از طریق action یا API.

#### افزودن API جدید

1. route در `app/api/.../route.ts`.
2. parse امن + validation با Zod.
3. کنترل احراز/مجوز.
4. خطاهای استاندارد JSON.

#### افزودن جدول + migration

1. تغییر `prisma/schema.prisma`.
2. اجرای `npm run db:migrate`.
3. به‌روزرسانی لایه repository و validation.
4. در صورت نیاز seed.

#### افزودن role/permission/auth

1. توسعه enum نقش در Prisma (در صورت نیاز).
2. claim mapping در callbackهای `auth.config.ts`.
3. سیاست مسیر در middleware.
4. enforce نهایی در سرور.

#### افزودن hook/utility/style/env/feature flag

- hook در `lib/` با مستندسازی side effect
- utility ترجیحاً pure و server-safe
- style بر اساس tokenهای Tailwind
- env جدید در `.env.example` و docs
- feature flag با منبع مرکزی (پیشنهادی)

### گردش کار توسعه

- نام‌گذاری شاخه پیشنهادی: `feat/*`, `fix/*`, `chore/*`
- چک‌لیست PR:
  - هم‌ترازی schema و validation
  - وجود auth check
  - انجام revalidate پس از mutation
  - به‌روزرسانی docs
- قبل merge: `npm run build`

### وضعیت تست فعلی

- فریم‌ورک تست خودکار هنوز تنظیم نشده است.
- چک‌لیست دستی حداقلی:
  - OTP login/register
  - checkout با تخفیف/حساسیت
  - تغییرات dashboard
  - CRUD ادمین و خروجی گزارش

## Expert Mode

### گردش Git و Release پیشنهادی

1. Trunk-based با branchهای کوتاه‌مدت.
2. squash merge با عنوان PR معنایی.
3. ترتیب release مبتنی بر migration:
   - schema غیرشکننده
   - app deploy
   - backfill/cleanup
4. release note شامل breaking/db/api/ops.

### حداقل CI/CD پیشنهادی

- CI:
  - install
  - `npx tsc --noEmit`
  - `npm run lint`
  - `npm run build`
- CD:
  - `npm run db:deploy`
  - deploy app
  - smoke test

### Runbook دیپلوی

| مرحله      | اقدام                        | اعتبارسنجی             |
| ---------- | ---------------------------- | ---------------------- |
| Build      | `npm run build`              | خطای build نداشته باشد |
| DB migrate | `npm run db:deploy`          | migration موفق         |
| Start      | `npm start` یا Vercel        | اپ بالا بیاید          |
| Smoke      | login/checkout/export        | مسیرهای حیاتی سالم     |
| Rollback   | بازگشت نسخه قبلی + راهبرد DB | سرویس پایدار شود       |

### Monitoring و Health Check

- لاگ درخواست/خطا برای actionها و routeها
- تست synthetic برای OTP/auth/checkout/export
- اتصال به پلتفرم Error Tracking (مثل Sentry)

### نقشه تست

- Unit برای `lib/server`
- Integration برای route/action با DB تست
- E2E برای مسیر کامل کاربر تا ادمین
- هدف پوشش بیشتر روی مسیرهای حیاتی

</details>
