"use client";

import { useState, useTransition } from "react";
import {
  PageHeader,
  Card,
  AddButton,
  Modal,
  Field,
  Input,
  Textarea,
  Select,
  EditButton,
  DeleteButton,
} from "@/components/admin/AdminUI";
import { Lightbulb, Minus, Plus } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { saveComboAction, deleteComboAction } from "@/app/admin/actions";

type SandwichLite = { id: string; name: string; basePrice: number };
type ComboItem = {
  sandwichId: string;
  quantity: number;
  name: string;
  basePrice: number;
};
type ComboView = {
  id: string;
  name: string;
  description: string | null;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  isActive: boolean;
  items: ComboItem[];
};

export default function CombosManager({
  initial,
  sandwiches,
  suggestions,
}: {
  initial: ComboView[];
  sandwiches: SandwichLite[];
  suggestions: { names: [string, string]; count: number }[];
}) {
  const [editing, setEditing] = useState<ComboView | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function remove(id: string) {
    startTransition(async () => {
      const r = await deleteComboAction(id);
      if (!r.ok) setError(r.error);
    });
  }

  return (
    <div>
      <PageHeader
        title="کمبوها و بسته‌های ترکیبی"
        subtitle="بسته‌های ساندویچی با قیمت‌گذاری و تخفیف پویا بسازید."
        action={
          <AddButton onClick={() => setEditing("new")} label="کمبو جدید" />
        }
      />

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5">
          {error}
        </div>
      )}

      {/* AI suggestions */}
      {suggestions.length > 0 && (
        <div className="mb-6 rounded-3xl bg-amber-50 border border-amber-200 p-5">
          <div className="flex items-center gap-2 font-bold text-amber-800 mb-2">
            <Lightbulb size={18} /> پیشنهاد کمبو بر اساس سفارش‌های قبلی
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full bg-white border border-amber-200 px-3 py-1.5 text-sm">
                {s.names[0]} + {s.names[1]}
                <span className="text-xs text-amber-700 tabular">
                  ({s.count.toLocaleString("fa-IR")} بار)
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {initial.map((c) => {
          const base = c.items.reduce(
            (s, it) => s + it.basePrice * it.quantity,
            0,
          );
          const final =
            c.discountType === "PERCENTAGE"
              ? base - Math.floor((base * c.discountValue) / 100)
              : Math.max(0, base - c.discountValue);
          return (
            <Card key={c.id}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold">{c.name}</div>
                  {c.description && (
                    <p className="text-sm text-ink-500 mt-1">{c.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <EditButton onClick={() => setEditing(c)} />
                  <DeleteButton onConfirm={() => remove(c.id)} />
                </div>
              </div>
              <ul className="mt-3 text-sm text-ink-600 space-y-1">
                {c.items.map((it) => (
                  <li key={it.sandwichId}>
                    {it.name} × {it.quantity.toLocaleString("fa-IR")}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-ink-400 line-through tabular">
                  {formatPrice(base)}
                </span>
                <span className="price text-brand-700">
                  {formatPrice(final)} ت
                </span>
              </div>
            </Card>
          );
        })}
        {initial.length === 0 && (
          <p className="text-ink-400 text-sm">هنوز کمبویی ساخته نشده است.</p>
        )}
      </div>

      {editing && (
        <ComboForm
          initial={editing === "new" ? null : editing}
          sandwiches={sandwiches}
          pending={pending}
          onClose={() => {
            setEditing(null);
            setError(null);
          }}
          onSave={(values) => {
            setError(null);
            startTransition(async () => {
              const r = await saveComboAction(
                editing === "new" ? null : editing.id,
                values,
              );
              if (r.ok) setEditing(null);
              else setError(r.error);
            });
          }}
        />
      )}
    </div>
  );
}

function ComboForm({
  initial,
  sandwiches,
  pending,
  onClose,
  onSave,
}: {
  initial: ComboView | null;
  sandwiches: SandwichLite[];
  pending: boolean;
  onClose: () => void;
  onSave: (v: Record<string, unknown>) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">(
    initial?.discountType ?? "PERCENTAGE",
  );
  const [discountValue, setDiscountValue] = useState(
    initial?.discountValue ?? 10,
  );
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [items, setItems] = useState<Record<string, number>>(
    Object.fromEntries(
      (initial?.items ?? []).map((i) => [i.sandwichId, i.quantity]),
    ),
  );

  function setQty(id: string, qty: number) {
    setItems((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  }

  return (
    <Modal open onClose={onClose} title={initial ? "ویرایش کمبو" : "کمبو جدید"}>
      <div className="space-y-4">
        <Field label="نام کمبو" required>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="توضیح">
          <Textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="نوع تخفیف">
            <Select
              value={discountType}
              onChange={(e) =>
                setDiscountType(e.target.value as "PERCENTAGE" | "FIXED")
              }>
              <option value="PERCENTAGE">درصدی</option>
              <option value="FIXED">مبلغ ثابت</option>
            </Select>
          </Field>
          <Field label="مقدار تخفیف">
            <Input
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(Number(e.target.value))}
              className="tabular"
            />
          </Field>
        </div>

        <div>
          <span className="text-sm font-medium text-ink-700">
            ساندویچ‌های کمبو <span className="text-brand-600">*</span>
          </span>
          <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
            {sandwiches.map((s) => {
              const qty = items[s.id] ?? 0;
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border border-ink-100 px-3 py-2">
                  <div className="text-sm">
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-xs text-ink-400 tabular">
                      {formatPrice(s.basePrice)} ت
                    </div>
                  </div>
                  <div className="inline-flex items-center bg-ink-50 rounded-full">
                    <button
                      type="button"
                      onClick={() => setQty(s.id, qty - 1)}
                      className="p-2"
                      aria-label="کم">
                      <Minus size={14} />
                    </button>
                    <span className="px-3 font-bold tabular text-sm">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(s.id, qty + 1)}
                      className="p-2"
                      aria-label="زیاد">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 accent-brand-500"
          />
          فعال باشد
        </label>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() =>
              onSave({
                name,
                description: description || null,
                discountType,
                discountValue,
                isActive,
                items: Object.entries(items).map(([sandwichId, quantity]) => ({
                  sandwichId,
                  quantity,
                })),
              })
            }
            disabled={pending}
            className="btn-primary">
            ذخیره
          </button>
          <button onClick={onClose} className="btn-ghost">
            انصراف
          </button>
        </div>
      </div>
    </Modal>
  );
}
