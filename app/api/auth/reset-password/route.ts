import { NextResponse } from "next/server";

/**
 * POST /api/auth/reset-password
 * Password auth has been removed. Kept as a compatibility endpoint.
 */
export async function POST(req: Request) {
  void req;
  return NextResponse.json({ error: "PASSWORD_AUTH_REMOVED" }, { status: 410 });
}
