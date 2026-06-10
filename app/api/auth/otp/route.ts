import { NextResponse } from "next/server";
import { requestOtp } from "@/lib/server/otp";
import { requestOtpSchema } from "@/lib/validation/auth";

/**
 * POST /api/auth/otp
 * Body: { phone, purpose? }
 * Issues a one-time code via SMS. Always returns 200 for valid input shape to
 * avoid leaking which numbers are registered (enumeration protection), except
 * for explicit rate-limit signalling.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }

  const parsed = requestOtpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const result = await requestOtp(parsed.data.phone, parsed.data.purpose);
  if (!result.ok) {
    if (result.error === "RATE_LIMITED") {
      return NextResponse.json(
        { error: "RATE_LIMITED", retryAfterMs: result.retryAfterMs },
        { status: 429 },
      );
    }
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  return NextResponse.json({ ok: true, cooldownMs: result.cooldownMs });
}
