import "server-only";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { sendOtpSms } from "./sms";
import { normalizeIranPhone } from "./phone";
import type { OtpPurpose } from "@prisma/client";

/**
 * OTP service — database-backed, hashed codes.
 *
 * Security properties (Phase 17):
 *  - Codes are stored as bcrypt hashes, never in plaintext.
 *  - 6-digit numeric, 2-minute TTL.
 *  - Per-phone request throttling (max 1 per 60s, max 5 per hour).
 *  - Max 5 verification attempts per code, then it is burned.
 *  - Single-use: consumedAt is set on success.
 */

const CODE_TTL_MS = 2 * 60 * 1000; // 2 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
const MAX_PER_HOUR = 5;
const MAX_ATTEMPTS = 5;

function generateCode(): string {
  // 6 digits, no leading-zero bias.
  return String(Math.floor(100000 + Math.random() * 900000));
}

export type RequestOtpResult =
  | { ok: true; cooldownMs: number }
  | {
      ok: false;
      error: "INVALID_PHONE" | "RATE_LIMITED";
      retryAfterMs?: number;
    };

export async function requestOtp(
  rawPhone: string,
  purpose: OtpPurpose,
): Promise<RequestOtpResult> {
  const phone = normalizeIranPhone(rawPhone);
  if (!phone) return { ok: false, error: "INVALID_PHONE" };

  const now = Date.now();
  const hourAgo = new Date(now - 60 * 60 * 1000);

  // Throttle: recent code in the last cooldown window?
  const recent = await prisma.otpCode.findFirst({
    where: {
      phone,
      purpose,
      createdAt: { gte: new Date(now - RESEND_COOLDOWN_MS) },
    },
    orderBy: { createdAt: "desc" },
  });
  if (recent) {
    const retryAfterMs =
      RESEND_COOLDOWN_MS - (now - recent.createdAt.getTime());
    return { ok: false, error: "RATE_LIMITED", retryAfterMs };
  }

  // Hourly cap.
  const countLastHour = await prisma.otpCode.count({
    where: { phone, purpose, createdAt: { gte: hourAgo } },
  });
  if (countLastHour >= MAX_PER_HOUR) {
    return { ok: false, error: "RATE_LIMITED", retryAfterMs: 60 * 60 * 1000 };
  }

  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);

  // Invalidate previous unconsumed codes for this phone+purpose.
  await prisma.otpCode.updateMany({
    where: { phone, purpose, consumedAt: null },
    data: { consumedAt: new Date() },
  });

  await prisma.otpCode.create({
    data: {
      phone,
      purpose,
      codeHash,
      expiresAt: new Date(now + CODE_TTL_MS),
    },
  });

  await sendOtpSms(phone, code);
  return { ok: true, cooldownMs: RESEND_COOLDOWN_MS };
}

export type VerifyOtpResult =
  | { ok: true; phone: string }
  | {
      ok: false;
      error:
        | "INVALID_PHONE"
        | "NO_CODE"
        | "EXPIRED"
        | "TOO_MANY_ATTEMPTS"
        | "MISMATCH";
    };

export async function verifyOtp(
  rawPhone: string,
  purpose: OtpPurpose,
  code: string,
): Promise<VerifyOtpResult> {
  const phone = normalizeIranPhone(rawPhone);
  if (!phone) return { ok: false, error: "INVALID_PHONE" };

  const record = await prisma.otpCode.findFirst({
    where: { phone, purpose, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!record) return { ok: false, error: "NO_CODE" };

  if (record.expiresAt.getTime() < Date.now()) {
    await prisma.otpCode.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    });
    return { ok: false, error: "EXPIRED" };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await prisma.otpCode.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    });
    return { ok: false, error: "TOO_MANY_ATTEMPTS" };
  }

  const matches = await bcrypt.compare(code, record.codeHash);
  if (!matches) {
    await prisma.otpCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, error: "MISMATCH" };
  }

  await prisma.otpCode.update({
    where: { id: record.id },
    data: { consumedAt: new Date() },
  });
  return { ok: true, phone };
}
