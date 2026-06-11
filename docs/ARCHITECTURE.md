# Chomp Sandwich — Architecture & Backend Notes

> Living document. Updated as the backend is built out across the 18-phase
> product expansion. Last updated: foundation pass (auth + DB).

## Stack

| Concern        | Choice                                             |
| -------------- | -------------------------------------------------- |
| Framework      | Next.js 14 (App Router), React 18, TypeScript      |
| Database       | PostgreSQL (Neon free tier in prod)                |
| ORM            | Prisma 5                                           |
| Auth           | Auth.js (NextAuth v5) — Credentials (password+OTP) |
| OTP / SMS      | Kavenegar (dev mode prints code to console)        |
| Validation     | Zod (every API boundary)                           |
| State (client) | Zustand (cart + catalog cache + auth modal)        |
| Styling        | Tailwind CSS                                       |
| Hosting (free) | Vercel + Neon + (optional) Upstash Redis           |

## Directory map (backend additions)

```
prisma/
  schema.prisma         # full data model (all Phase-2 entities)
  seed.ts               # seeds catalog from lib/seed.ts + admin user
lib/
  db.ts                 # Prisma singleton
  auth/
    index.ts            # NextAuth instance (Node runtime, DB+bcrypt)
    auth.config.ts      # edge-safe config (used by middleware)
    client.ts           # useCurrentUser / useIsAdmin / signOut
    session.ts          # server helpers: requireUser / requireAdmin
  server/
    phone.ts            # Iranian phone normalization
    sms.ts              # Kavenegar client (+ dev console fallback)
    otp.ts              # hashed OTP issue/verify, throttling
    users.ts            # find/create user, referral wiring, password
  validation/
    auth.ts             # Zod schemas
  authModal.ts          # global auth-modal store (phone-first UX)
app/api/auth/
  [...nextauth]/route.ts
  otp/route.ts          # POST issue OTP
  check-phone/route.ts  # POST does phone exist?
  register/route.ts     # POST complete signup (verifies REGISTER OTP)
  reset-password/route.ts
components/
  AuthModal.tsx         # phone → password → (send code) → OTP / register
  Providers.tsx         # SessionProvider + AuthModal mount
middleware.ts           # gates all routes except public ones
types/next-auth.d.ts    # session/JWT augmentation (id, role, phone)
```

## Authentication flow (implemented)

1. User clicks the account icon → global **AuthModal** opens.
2. **Phone step** → `POST /api/auth/check-phone`.
   - exists + has password → **password step**
   - exists, no password → OTP login
   - new → **register step**
3. **Password step** → `signIn("credentials", { mode: "password" })`.
   - "ورود با کد پیامکی" button → `POST /api/auth/otp` → **OTP step**.
4. **Register step** → name + optional password → `POST /api/auth/otp`
   (purpose `REGISTER`) → **OTP step**.
5. **OTP step** → for register: `POST /api/auth/register`; then
   `signIn("credentials", { mode: "otp" })`.

OTP codes: 6 digits, bcrypt-hashed at rest, 2-minute TTL, single-use, max 5
verify attempts, 60s resend cooldown, 5/hour cap.

## Authorization

- **Edge middleware** ([middleware.ts](../middleware.ts)) redirects unauthenticated
  users to `/login?next=…`. `/admin/**` additionally requires `role === ADMIN`.
- **Public routes**: `/`, `/menu`, `/login`, `/about`, `/contact`, plus
  `/api/auth/*` and static assets.
- **Server helpers** (`requireUser`, `requireAdmin`) enforce ownership inside
  RSC pages and route handlers.

## Data model highlights

- `User` carries `referralCode`, `invitedById`, `role`, `passwordHash`,
  `phoneVerified`.
- Duplicate-rating protection: `@@unique([userId, orderId, sandwichId])` on
  `SandwichRating` (ratings require a real `orderId`).
- Discount enforcement: `DiscountRedemption` tracks each use so `usageLimit` /
  `usagePerUser` can be checked server-side.
- Recipe de-dupe: `CustomSandwich.recipeHash` (sorted ingredient+qty hash).
- Indexes added on hot paths: `Order(userId, createdAt)`,
  `SandwichRating(sandwichId)`, `Address(userId, isDefault)`,
  `CustomSandwich(isPublic, averageRating)` and `(isPublic, totalOrders)`.

## Migration strategy (prototype → Postgres)

The old localStorage Zustand catalog (`lib/store.ts`, `lib/seed.ts`) is kept as
the seed source of truth. `prisma/seed.ts` imports those constants so the DB and
the prototype never drift. Domains are migrated to server APIs one at a time;
the cart stays client-side and writes through the server only at checkout.

## Customer dashboard (implemented)

Prisma-backed, fully auth-guarded under `/dashboard` (server actions re-derive
the user from the session — client ids are never trusted):

| Route                  | Feature                                                            | Server layer                                                |
| ---------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------- |
| `/dashboard`           | Overview (orders, spend, favorite, referral, allergies, addresses) | `orders.ts`, `referrals.ts`, `allergies.ts`, `addresses.ts` |
| `/dashboard/orders`    | Order history + reorder/add-to-cart                                | `lib/server/orders.ts`                                      |
| `/dashboard/addresses` | Multiple addresses CRUD + default                                  | `lib/server/addresses.ts`                                   |
| `/dashboard/allergies` | Allergen selection + warnings                                      | `lib/server/allergies.ts`                                   |
| `/dashboard/referrals` | Invite code/link, conversion stats                                 | `lib/server/referrals.ts`                                   |
| `/dashboard/saved`     | Saved sandwiches (stub — next slice)                               | —                                                           |

Server actions: `app/dashboard/actions.ts` (addresses + allergies),
`app/checkout/actions.ts` (`placeOrderAction` — recomputes all prices/totals
server-side from the catalog, then persists the order + items).

Checkout now **dual-writes**: the existing localStorage store (so the current
admin panel keeps working) **and** the database (source of truth for history,
ratings, analytics). The admin panel migration to Postgres is a later slice.

## NPM scripts

| Script               | Purpose                          |
| -------------------- | -------------------------------- |
| `npm run dev`        | Dev server                       |
| `npm run build`      | `prisma generate` + `next build` |
| `npm run db:migrate` | Create/apply dev migration       |
| `npm run db:deploy`  | Apply migrations in prod         |
| `npm run db:seed`    | Seed catalog + admin             |
| `npm run db:studio`  | Prisma Studio data browser       |
| `npm run db:reset`   | Drop + re-migrate + seed         |

## Known follow-ups (next slices)

Custom-sandwich builder → save/publish (features 2,7,10), community marketplace

- top-3 ranking (feature 4), post-order ratings (feature 5), admin
  discounts/categories/customers/analytics, combos, referral admin view,
  reporting with date ranges + CSV/Excel, caching, and the test suite.

## Security notes / audit

`npm install` reported advisories in transitive deps. Run `npm audit` before
deploy; none are in our first-party code path, but pin/upgrade where possible.
Secrets live only in `.env` (gitignored); `.env.example` documents every key.
