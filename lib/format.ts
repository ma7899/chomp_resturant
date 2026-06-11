/** Shared, environment-agnostic formatting helpers (safe on server & client). */

export function formatPrice(t: number): string {
  return new Intl.NumberFormat("fa-IR").format(Math.round(t));
}

export function formatDateFa(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function formatPercent(n: number): string {
  return new Intl.NumberFormat("fa-IR", {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(n);
}
