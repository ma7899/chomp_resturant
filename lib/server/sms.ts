import "server-only";
import { normalizeIranPhone } from "./phone";

/**
 * SMS delivery via Kavenegar (https://kavenegar.com).
 *
 * Two modes:
 *  - OTP_DEV_MODE="1" or no API key  → logs the code to the server console
 *    so you can develop without spending SMS credit.
 *  - Otherwise uses Kavenegar's Verify/Lookup API (preferred for Iranian
 *    carriers — uses a pre-approved template and bypasses spam filtering).
 *
 * Docs: https://kavenegar.com/rest.html
 */

const API_KEY = process.env.KAVENEGAR_API_KEY ?? "";
const TEMPLATE = process.env.KAVENEGAR_OTP_TEMPLATE ?? "chomp-otp";
const SENDER = process.env.KAVENEGAR_SENDER ?? "";
const DEV_MODE = process.env.OTP_DEV_MODE === "1" || !API_KEY;

export async function sendOtpSms(phone: string, code: string): Promise<void> {
  const local = normalizeIranPhone(phone);
  if (!local) throw new Error("INVALID_PHONE");

  if (DEV_MODE) {
    // eslint-disable-next-line no-console
    console.info(
      `\n📱 [DEV OTP] code for ${local}: ${code}  (set OTP_DEV_MODE=0 + KAVENEGAR_API_KEY to send real SMS)\n`,
    );
    return;
  }

  // Kavenegar Verify Lookup — sends `code` into the {token} slot of TEMPLATE.
  const url =
    `https://api.kavenegar.com/v1/${API_KEY}/verify/lookup.json` +
    `?receptor=${encodeURIComponent(local)}` +
    `&token=${encodeURIComponent(code)}` +
    `&template=${encodeURIComponent(TEMPLATE)}`;

  const res = await fetch(url, { method: "GET", cache: "no-store" });
  if (!res.ok) {
    throw new Error(`SMS_SEND_FAILED:${res.status}`);
  }
  const json = (await res.json()) as { return?: { status?: number } };
  if (json.return?.status && json.return.status !== 200) {
    throw new Error(`SMS_GATEWAY_ERROR:${json.return.status}`);
  }
}

/** Plain (non-template) SMS — used for transactional notices, not OTP. */
export async function sendPlainSms(
  phone: string,
  message: string,
): Promise<void> {
  const local = normalizeIranPhone(phone);
  if (!local) throw new Error("INVALID_PHONE");

  if (DEV_MODE || !SENDER) {
    // eslint-disable-next-line no-console
    console.info(`\n📱 [DEV SMS] to ${local}: ${message}\n`);
    return;
  }

  const url =
    `https://api.kavenegar.com/v1/${API_KEY}/sms/send.json` +
    `?receptor=${encodeURIComponent(local)}` +
    `&sender=${encodeURIComponent(SENDER)}` +
    `&message=${encodeURIComponent(message)}`;

  const res = await fetch(url, { method: "GET", cache: "no-store" });
  if (!res.ok) throw new Error(`SMS_SEND_FAILED:${res.status}`);
}
