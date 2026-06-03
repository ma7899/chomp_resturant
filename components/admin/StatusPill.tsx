"use client";

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    new: { label: "جدید", cls: "bg-brand-100 text-brand-700" },
    preparing: {
      label: "در حال آماده‌سازی",
      cls: "bg-amber-100 text-amber-700",
    },
    delivered: { label: "تحویل شد", cls: "bg-emerald-100 text-emerald-700" },
    cancelled: { label: "لغو شد", cls: "bg-red-100 text-red-700" },
  };
  const m = map[status] ?? { label: status, cls: "bg-ink-100 text-ink-700" };
  return (
    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${m.cls}`}>
      {m.label}
    </span>
  );
}
