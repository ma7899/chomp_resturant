# API Specification — Auth Foundation

All request/response bodies are JSON. Validation uses Zod; failures return
`422` with `{ error: "VALIDATION", issues }`. Phone numbers accept Iranian
formats (`09xxxxxxxxx`, `+98…`, Persian digits) and are normalized server-side.

## `POST /api/auth/check-phone`

Decides which step the login modal shows.

**Body:** `{ "phone": string }`
**200:** `{ "exists": boolean, "hasPassword": boolean }`

## `POST /api/auth/otp`

Issues a one-time SMS code (hashed, 2-min TTL, single-use).

**Body:** `{ "phone": string, "purpose"?: "LOGIN" | "REGISTER" | "RESET" }`
**200:** `{ "ok": true, "cooldownMs": number }`
**429:** `{ "error": "RATE_LIMITED", "retryAfterMs": number }`
**422:** validation / invalid phone

Throttling: 1 per 60s, 5 per hour per phone+purpose.

## `POST /api/auth/register`

Completes signup after a `REGISTER` OTP.

**Body:** `{ phone, code, name?, password?, referredByCode? }`
**200:** `{ "ok": true }`
**409:** `{ "error": "ALREADY_EXISTS" }`
**401:** OTP wrong/expired

Creates the `User` (+ `Referral` row if `referredByCode` resolves).

## `POST /api/auth/reset-password`

Sets a new password after a `RESET` OTP.

**Body:** `{ phone, code, password }`
**200:** `{ "ok": true }` · **404:** unknown phone · **401:** OTP invalid

## `POST /api/auth/[...nextauth]` (Auth.js)

Credentials provider with two modes via the `mode` field:

- `mode: "password"` → `{ phone, password }`
- `mode: "otp"` → `{ phone, code }` (code previously issued with purpose `LOGIN`)

Returns a JWT session carrying `{ id, role, phone }`.

## Authorization matrix

| Area                                         | Rule                        |
| -------------------------------------------- | --------------------------- |
| `/menu`, `/`, `/about`, `/contact`, `/login` | public                      |
| `/api/auth/*`, static assets                 | public                      |
| everything else                              | requires session            |
| `/admin/**`                                  | requires `role === "ADMIN"` |

Server helpers: `requireUser(next?)`, `requireAdmin()`, `getCurrentUser()` in
`lib/auth/session.ts`.

## Planned endpoints (later phases)

`/api/addresses`, `/api/orders`, `/api/custom-sandwiches`, `/api/ratings`,
`/api/community`, `/api/referrals`, `/api/allergies`, `/api/discounts`,
`/api/admin/*`, `/api/reports/*` — to be added per the phase roadmap in
[ARCHITECTURE.md](ARCHITECTURE.md).
