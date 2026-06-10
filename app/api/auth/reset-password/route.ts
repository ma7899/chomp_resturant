import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/server/otp";
import { findUserByPhone, setUserPassword } from "@/lib/server/users";
import { resetPasswordSchema } from "@/lib/validation/auth";

/**
 * POST /api/auth/reset-password
 * Body: { phone, code, password }
 *
 * Verifies a RESET OTP and sets a new password (Phase 3 — forgot/reset).
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }
  const { phone, code, password } = parsed.data;

  const user = await findUserByPhone(phone);
  if (!user) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const verified = await verifyOtp(phone, "RESET", code);
  if (!verified.ok) {
    return NextResponse.json({ error: verified.error }, { status: 401 });
  }

  await setUserPassword(user.id, password);
  return NextResponse.json({ ok: true });
}
