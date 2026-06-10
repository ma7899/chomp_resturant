import { NextResponse } from "next/server";
import { findUserByPhone } from "@/lib/server/users";
import { checkPhoneSchema } from "@/lib/validation/auth";

/**
 * POST /api/auth/check-phone
 * Body: { phone }
 * Used by the login modal to decide whether to show the password step
 * (existing user) or kick off the registration flow (new user).
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

  const user = await findUserByPhone(parsed.data.phone);
  return NextResponse.json({
    exists: !!user,
    hasPassword: !!user?.passwordHash,
  });
}
