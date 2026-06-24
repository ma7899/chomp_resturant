"use client";

import { useState, useTransition } from "react";
import { MapPin, Plus, Star, Trash2, Pencil, X, Check } from "lucide-react";
import clsx from "clsx";
import {
  createAddressAction,
  updateAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
} from "@/app/dashboard/actions";

export type AddressView = {
  id: string;
  title: string;
  province: string;
  city: string;
  street: string;
  alley: string | null;
  buildingNumber: string | null;
  unit: string | null;
  postalCode: string | null;
  isDefault: boolean;
};

const EMPTY: Omit<AddressView, "id"> = {
  title: "",
  province: "Isfahan",
  city: "Isfahan",
  street: "",
  alley: "",
  buildingNumber: "",
  unit: "",
  postalCode: "",
  isDefault: false,
};

export default function AddressManager({
  initial,
}: {
  initial: AddressView[];
}) {
  const canAddMore = initial.length < 2;
  const [editing, setEditing] = useState<AddressView | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onDelete(id: string) {
    if (!confirm("این آدرس حذف شود؟")) return;
    startTransition(async () => {
      const r = await deleteAddressAction(id);
      if (!r.ok) setError(r.error);
    });
  }

  function onSetDefault(id: string) {
    startTransition(async () => {
      const r = await setDefaultAddressAction(id);
      if (!r.ok) setError(r.error);
    });
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5">
          {error}
        </div>
      )}

      {editing ? (
        <AddressForm
          initial={editing === "new" ? null : editing}
          canEditDefault={initial.length > 1}
          pending={pending}
          onCancel={() => {
            setEditing(null);
            setError(null);
          }}
          onSubmit={(values) => {
            setError(null);
            startTransition(async () => {
              const r =
                editing === "new"
                  ? await createAddressAction(values)
                  : await updateAddressAction(editing.id, values);
              if (r.ok) setEditing(null);
              else setError(r.error);
            });
          }}
        />
      ) : (
        <button
          disabled={!canAddMore}
          onClick={() => setEditing("new")}
          className="btn-outline w-full sm:w-auto">
          <Plus size={18} /> افزودن آدرس جدید
        </button>
      )}

      {!canAddMore && (
        <p className="text-xs text-ink-500">حداکثر ۲ آدرس قابل ثبت است.</p>
      )}

      {initial.length === 0 && !editing && (
        <div className="rounded-3xl bg-white border border-dashed border-ink-200 p-10 text-center text-ink-400">
          <MapPin size={40} className="mx-auto mb-3 opacity-40" />
          هنوز آدرسی ثبت نکرده‌اید.
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {initial.map((a) => (
          <div
            key={a.id}
            className={clsx(
              "rounded-3xl bg-white border p-5",
              a.isDefault ? "border-brand-300" : "border-ink-100",
            )}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold">{a.title}</span>
                {a.isDefault && (
                  <span className="chip !bg-brand-500 !text-white text-[10px]">
                    پیش‌فرض
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditing(a)}
                  className="p-2 text-ink-400 hover:text-brand-600"
                  aria-label="ویرایش">
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => onDelete(a.id)}
                  className="p-2 text-ink-400 hover:text-red-500"
                  aria-label="حذف">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <p className="text-sm text-ink-600 mt-2 leading-7">
              {a.province}، {a.city}، {a.street}
              {a.alley ? `، کوچه ${a.alley}` : ""}
              {a.buildingNumber ? `، پلاک ${a.buildingNumber}` : ""}
              {a.unit ? `، واحد ${a.unit}` : ""}
            </p>
            {a.postalCode && (
              <p className="text-xs text-ink-400 mt-1 tabular">
                کد پستی: {a.postalCode}
              </p>
            )}
            {!a.isDefault && (
              <button
                onClick={() => onSetDefault(a.id)}
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700">
                <Star size={14} /> انتخاب به‌عنوان پیش‌فرض
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AddressForm({
  initial,
  canEditDefault,
  pending,
  onCancel,
  onSubmit,
}: {
  initial: AddressView | null;
  canEditDefault: boolean;
  pending: boolean;
  onCancel: () => void;
  onSubmit: (values: Record<string, unknown>) => void;
}) {
  const [v, setV] = useState({
    title: initial?.title ?? EMPTY.title,
    province: initial?.province ?? EMPTY.province,
    city: initial?.city ?? EMPTY.city,
    street: initial?.street ?? EMPTY.street,
    alley: initial?.alley ?? "",
    buildingNumber: initial?.buildingNumber ?? "",
    unit: initial?.unit ?? "",
    postalCode: initial?.postalCode ?? "",
    isDefault: initial?.isDefault ?? false,
  });

  const set = (k: keyof typeof v, val: string | boolean) =>
    setV((p) => ({ ...p, [k]: val }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(v);
      }}
      className="rounded-3xl bg-white border border-ink-100 p-5 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">{initial ? "ویرایش آدرس" : "آدرس جدید"}</h2>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 text-ink-400 hover:text-ink-700"
          aria-label="بستن">
          <X size={20} />
        </button>
      </div>

      <Field label="عنوان (مثلاً خانه، محل کار)" required>
        <input
          required
          className="acc-input"
          value={v.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="خانه"
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="استان" required>
          <input
            required
            className="acc-input"
            value={v.province}
            disabled
            readOnly
            onChange={() => undefined}
          />
        </Field>
        <Field label="شهر" required>
          <input
            required
            className="acc-input"
            value={v.city}
            disabled
            readOnly
            onChange={() => undefined}
          />
        </Field>
      </div>

      <Field label="خیابان / نشانی" required>
        <input
          required
          className="acc-input"
          value={v.street}
          onChange={(e) => set("street", e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Field label="کوچه">
          <input
            className="acc-input"
            value={v.alley ?? ""}
            onChange={(e) => set("alley", e.target.value)}
          />
        </Field>
        <Field label="پلاک">
          <input
            className="acc-input"
            value={v.buildingNumber ?? ""}
            onChange={(e) => set("buildingNumber", e.target.value)}
          />
        </Field>
        <Field label="واحد">
          <input
            className="acc-input"
            value={v.unit ?? ""}
            onChange={(e) => set("unit", e.target.value)}
          />
        </Field>
        <Field label="کد پستی">
          <input
            inputMode="numeric"
            dir="ltr"
            className="acc-input tabular"
            value={v.postalCode ?? ""}
            onChange={(e) =>
              set("postalCode", e.target.value.replace(/\D/g, "").slice(0, 10))
            }
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={v.isDefault}
          disabled={!canEditDefault}
          onChange={(e) => set("isDefault", e.target.checked)}
          className="w-4 h-4 accent-brand-500"
        />
        به‌عنوان آدرس پیش‌فرض ذخیره شود
      </label>

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={pending} className="btn-primary">
          <Check size={18} /> ذخیره
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost">
          انصراف
        </button>
      </div>

      <style>{`
        .acc-input {
          width: 100%;
          border-radius: 14px;
          border: 1px solid #e7e7e7;
          padding: 11px 13px;
          background: #fff;
          font: inherit;
          outline: none;
          transition: border .2s, box-shadow .2s;
        }
        .acc-input:focus {
          border-color: #f56a16;
          box-shadow: 0 0 0 3px rgba(245,106,22,.15);
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink-700">
        {label} {required && <span className="text-brand-600">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
