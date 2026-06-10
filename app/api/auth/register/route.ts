import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/server/otp";
import { createUser, findUserByPhone } from "@/lib/server/users";
import { registerSchema } from "@/lib/validation/auth";

/**
 * POST /api/auth/register
 * Body: { phone, code, name?, password?, referredByCode? }
 *
 * Completes signup after the phone has been verified via OTP (purpose REGISTER).
 * Creates the user (+ referral link if a code was provided) and returns success.
 * The client then signs in through Auth.js with mode="otp" or password.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }
  const { phone, code, name, password, referredByCode } = parsed.data;

  // Reject if the phone is already taken.
  const existing = await findUserByPhone(phone);
  if (existing) {
    return NextResponse.json({ error: "ALREADY_EXISTS" }, { status: 409 });
  }

  // Verify the registration OTP.
  const verified = await verifyOtp(phone, "REGISTER", code);
  if (!verified.ok) {
    return NextResponse.json({ error: verified.error }, { status: 401 });
  }

  await createUser({
    phone,
    name,
    password,
    phoneVerified: true,
    referredByCode,
  });

  return NextResponse.json({ ok: true });
}
