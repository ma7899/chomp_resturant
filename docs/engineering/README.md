# Chomp Engineering Documentation

> Official internal engineering docs for onboarding, maintenance, extension, and scale.

Primary handbook (HTML): `docs/engineering/engineering-handbook.html`

## English | فارسی

<details open>
<summary>English</summary>

## How To Use This Documentation

- Start with the HTML handbook if you want one comprehensive document:
  - `docs/engineering/engineering-handbook.html`
  - Includes bilingual language switch (`English | فارسی`)
  - Includes mode switch (`Beginner` and `Expert`)
  - Includes `Quick Start` for first-time setup and subsequent runs
  - Includes `Database Migration Roadmap` for safe schema evolution
- Audience modes are available on every page:
  - Beginner Mode: Step-by-step guidance, glossary hints, common mistakes, screenshot placeholders
  - Expert Mode: Implementation details, tradeoffs, extension points, performance and ops guidance
- Language support is available on every page via `English | فارسی` sections.
- This documentation set is modular; read pages in order for onboarding, or jump by topic for incident/debug work.

## Document Map

| #   | Page                          | Scope                                                                |
| --- | ----------------------------- | -------------------------------------------------------------------- |
| 1   | `01-overview.md`              | Project overview, business goals, philosophy, repository structure   |
| 2   | `02-architecture.md`          | Frontend/backend/database architecture, dependencies, state, routing |
| 3   | `03-modules-components.md`    | Module docs, component docs, hooks, utilities                        |
| 4   | `04-api-auth-security.md`     | API contracts, authentication, authorization, security model         |
| 5   | `05-database.md`              | Prisma schema, relations, constraints, migrations, optimization      |
| 6   | `06-workflows-ops.md`         | Developer tasks, workflow, testing strategy, deployment              |
| 7   | `07-performance-quality.md`   | Performance, common problems, major user flows                       |
| 8   | `08-governance-onboarding.md` | Tech debt, roadmap, ADRs, standards, glossary, AI analysis           |

## Suggested Reading Paths

- New joiner (Day 1): 01 -> 02 -> 03
- Backend/API engineer: 02 -> 04 -> 05
- Frontend engineer: 02 -> 03 -> 07
- Tech lead/architect: 02 -> 05 -> 08
- On-call incident: 07 -> 04 -> 05

## Documentation UX Conventions

- Mermaid diagrams are source-of-truth architecture visuals.
- Collapsible blocks are used to reduce cognitive load.
- Tables are used for contracts, responsibilities, and risks.
- File paths are included so engineers can immediately navigate code.

</details>

<details>
<summary>فارسی</summary>

## روش استفاده از مستندات

- اگر یک مستند جامع یک‌جا می‌خواهید، از فایل HTML شروع کنید:
  - `docs/engineering/engineering-handbook.html`
  - دارای سوییچ زبان (`English | فارسی`)
  - دارای سوییچ حالت (`Beginner` و `Expert`)
  - شامل `Quick Start` برای اجرای اول و اجراهای بعدی
  - شامل `Database Migration Roadmap` برای مهاجرت امن اسکیما
- در تمام صفحات، دو حالت دارید:
  - Beginner Mode: آموزش مرحله‌ای، اشتباهات رایج، واژه‌نامه، جای‌خالی اسکرین‌شات
  - Expert Mode: جزئیات پیاده‌سازی، Tradeoffها، نقاط توسعه، عملکرد و عملیات
- در همه صفحات، پشتیبانی دو زبانه با بخش `English | فارسی` وجود دارد.
- ساختار مستندات ماژولار است؛ برای آنبوردینگ از ابتدا بخوانید یا برای رفع اشکال مستقیم به صفحه مرتبط بروید.

## نقشه مستندات

| #   | صفحه                          | محدوده                                                    |
| --- | ----------------------------- | --------------------------------------------------------- |
| 1   | `01-overview.md`              | معرفی پروژه، اهداف کسب‌وکار، فلسفه، ساختار ریپو           |
| 2   | `02-architecture.md`          | معماری فرانت/بک/دیتابیس، وابستگی‌ها، استیت، مسیریابی      |
| 3   | `03-modules-components.md`    | مستند ماژول‌ها، کامپوننت‌ها، هوک‌ها، ابزارها              |
| 4   | `04-api-auth-security.md`     | APIها، احراز هویت، مجوزدهی، مدل امنیت                     |
| 5   | `05-database.md`              | اسکیمای Prisma، روابط، محدودیت‌ها، مایگریشن، بهینه‌سازی   |
| 6   | `06-workflows-ops.md`         | کارهای رایج توسعه، گردش کار، تست، دیپلوی                  |
| 7   | `07-performance-quality.md`   | عملکرد، مشکلات رایج، جریان‌های اصلی کاربر                 |
| 8   | `08-governance-onboarding.md` | بدهی فنی، نقشه راه، ADR، استانداردها، واژه‌نامه، تحلیل AI |

## مسیرهای مطالعه پیشنهادی

- تازه‌وارد (روز اول): 01 -> 02 -> 03
- مهندس بک‌اند/API: 02 -> 04 -> 05
- مهندس فرانت‌اند: 02 -> 03 -> 07
- لید فنی/معمار: 02 -> 05 -> 08
- رفع Incident: 07 -> 04 -> 05

## اصول UX مستندات

- نمودارهای Mermaid مرجع معماری هستند.
- بخش‌های جمع‌شونده برای کاهش بار شناختی استفاده شده‌اند.
- جداول برای قراردادها، مسئولیت‌ها و ریسک‌ها هستند.
- مسیر فایل‌ها برای پرش سریع به کد ارائه شده‌اند.

</details>
