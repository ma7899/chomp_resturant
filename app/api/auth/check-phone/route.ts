import { NextResponse } from "next/server";
import { findUserByPhone } from "@/lib/server/users";
import { checkPhoneSchema } from "@/lib/validation/auth";

/**
 * POST /api/auth/check-phone
 * Body: { phone }
 * Used by the login modal to decide if this phone already has an account
 * (OTP login) or should continue with registration.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }

  const parsed = checkPhoneSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  try {
    const user = await findUserByPhone(parsed.data.phone);
    return NextResponse.json({
      exists: !!user,
    });
  } catch (err) {
    // Almost always a database connectivity / setup problem.
    console.error("check-phone DB error:", err);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 503 });
  }
}
