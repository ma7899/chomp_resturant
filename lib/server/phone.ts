import "server-only";

/**
 * Phone number normalization for Iranian numbers.
 *
 * Accepts: 0912xxxxxxx, +98912xxxxxxx, 98912xxxxxxx, 912xxxxxxx
 * Returns canonical local form: 0912xxxxxxx (11 digits) or null if invalid.
 */
export function normalizeIranPhone(input: string): string | null {
  if (!input) return null;
  // Convert Persian/Arabic digits to ASCII.
  const ascii = input
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  const digits = ascii.replace(/\D/g, "");

  let local: string | null = null;
  if (/^09\d{9}$/.test(digits)) local = digits;
  else if (/^9\d{9}$/.test(digits)) local = "0" + digits;
  else if (/^98\d{10}$/.test(digits)) local = "0" + digits.slice(2);
  else if (/^0098\d{10}$/.test(digits)) local = "0" + digits.slice(4);

  return local;
}

/** Pretty +98 form for SMS gateways that prefer E.164. */
export function toE164Iran(local: string): string {
  return "+98" + local.slice(1);
}
