"use client";

import { useState, useTransition } from "react";
import { Check, ShieldAlert, Save } from "lucide-react";
import clsx from "clsx";
import { saveAllergiesAction } from "@/app/dashboard/actions";

type Group = {
  kind: string;
  label: string;
  items: { id: string; name: string }[];
};

export default function AllergyManager({
  groups,
  initialSelected,
}: {
  groups: Group[];
  initialSelected: string[];
}) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(initialSelected),
  );
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggle(id: string) {
    setSaved(false);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const r = await saveAllergiesAction(Array.from(selected));
      if (r.ok) setSaved(true);
      else setError(r.error);
    });
  }

  return (
    <div className="space-y-5">
      {selected.size > 0 && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 flex items-center gap-2">
          <ShieldAlert size={18} />
          {selected.size.toLocaleString("fa-IR")} ماده به‌عنوان حساسیت‌زا انتخاب
          شده است.
        </div>
      )}

      {groups.map((g) => (
        <div
          key={g.kind}
          className="rounded-3xl bg-white border border-ink-100 p-5">
          <h2 className="font-bold mb-3">{g.label}</h2>
          <div className="flex flex-wrap gap-2">
            {g.items.map((it) => {
              const active = selected.has(it.id);
              return (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => toggle(it.id)}
                  className={clsx(
                    "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm border-2 transition",
                    active
                      ? "border-red-400 bg-red-50 text-red-700 font-semibold"
                      : "border-ink-100 text-ink-600 hover:border-brand-300",
                  )}>
                  {active && <Check size={14} />}
                  {it.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 sticky bottom-4">
        <button onClick={save} disabled={pending} className="btn-primary">
          <Save size={18} /> ذخیره حساسیت‌ها
        </button>
        {saved && (
          <span className="text-sm text-green-600 font-semibold">
            ذخیره شد ✓
          </span>
        )}
      </div>
    </div>
  );
}
