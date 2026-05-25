/**
 * Production-safe UUID generator.
 *
 * `crypto.randomUUID` is only available in secure contexts (https / localhost)
 * and on relatively recent browsers. Many mobile in-app webviews, older
 * Android Chrome, older iOS Safari, and any non-secure http origin will throw
 * "crypto.randomUUID is not a function".
 *
 * Strategy (in order):
 *   1. native `crypto.randomUUID()`
 *   2. RFC 4122 v4 built from `crypto.getRandomValues`
 *   3. Math.random fallback (non-cryptographic; only used as last resort,
 *      perfectly fine for cart line ids)
 */
export function safeUUID(): string {
  if (typeof globalThis !== "undefined") {
    const c = (globalThis as typeof globalThis & { crypto?: Crypto }).crypto;

    if (c && typeof c.randomUUID === "function") {
      try {
        return c.randomUUID();
      } catch {
        /* fall through */
      }
    }

    if (c && typeof c.getRandomValues === "function") {
      const bytes = new Uint8Array(16);
      c.getRandomValues(bytes);
      // Per RFC 4122 §4.4
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex: string[] = [];
      for (let i = 0; i < 16; i++)
        hex.push(bytes[i].toString(16).padStart(2, "0"));
      return (
        hex.slice(0, 4).join("") +
        "-" +
        hex.slice(4, 6).join("") +
        "-" +
        hex.slice(6, 8).join("") +
        "-" +
        hex.slice(8, 10).join("") +
        "-" +
        hex.slice(10, 16).join("")
      );
    }
  }

  // Final fallback — collision-resistant enough for a client-side cart line id.
  const rand = () => Math.random().toString(16).slice(2).padStart(12, "0");
  return `${rand().slice(0, 8)}-${rand().slice(0, 4)}-4${rand().slice(0, 3)}-${(
    8 + Math.floor(Math.random() * 4)
  ).toString(16)}${rand().slice(0, 3)}-${rand().slice(0, 12)}`;
}
