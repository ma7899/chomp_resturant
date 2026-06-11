"use client";

import { useState, useTransition } from "react";
import {
  PageHeader,
  Card,
  AddButton,
  Modal,
  Field,
  Input,
  Select,
  EditButton,
  DeleteButton,
} from "@/components/admin/AdminUI";
import { formatPrice } from "@/lib/format";
import { saveDiscountAction, deleteDiscountAction } from "@/app/admin/actions";

type DiscountView = {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  percentage: number | null;
  fixedAmount: number | null;
  minPurchase: number | null;
  maxDiscount: number | null;
  startDate: string | null;
  endDate: string | null;
  usageLimit: number | null;
  usagePerUser: number | null;
  isActive: boolean;
  used: number;
};

const EMPTY: Omit<DiscountView, "id" | "used"> = {
  code: "",
  type: "PERCENTAGE",
  percentage: 10,
  fixedAmount: null,
  minPurchase: null,
  maxDiscount: null,
  startDate: null,
  endDate: null,
  usageLimit: null,
  usagePerUser: null,
  isActive: true,
};

export default function DiscountsManager({
  initial,
}: {
  initial: DiscountView[];
}) {
  const [editing, setEditing] = useState<DiscountView | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function remove(id: string) {
    startTransition(async () => {
      const r = await deleteDiscountAction(id);
      if (!r.ok) setError(r.error);
    });
  }

  return (
    <div>
      <PageHeader
        title="مدیریت تخفیف‌ها"
        subtitle="کدهای تخفیف درصدی یا مبلغی با کف/سقف خرید، تاریخ اعتبار و سقف مصرف."
        action={
          <AddButton onClick={() => setEditing("new")} label="تخفیف جدید" />
        }
      />

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5">
          {error}
        </div>
      )}

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-50/60 text-ink-500">
              <tr>
                <Th>کد</Th>
                <Th>نوع / مقدار</Th>
                <Th>کف خرید</Th>
                <Th>اعتبار</Th>
                <Th>مصرف</Th>
                <Th>وضعیت</Th>
                <Th> </Th>
              </tr>
            </thead>
            <tbody>
              {initial.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-ink-400 py-10">
                    هنوز تخفیفی تعریف نشده است.
                  </td>
                </tr>
              )}
              {initial.map((d) => (
                <tr key={d.id} className="border-t border-ink-100">
                  <Td>
                    <span className="font-bold tabular">{d.code}</span>
                  </Td>
                  <Td>
                    {d.type === "PERCENTAGE"
                      ? `${d.percentage?.toLocaleString("fa-IR")}٪`
                      : `${formatPrice(d.fixedAmount ?? 0)} ت`}
                    {d.maxDiscount
                      ? ` (سقف ${formatPrice(d.maxDiscount)})`
                      : ""}
                  </Td>
                  <Td>{d.minPurchase ? formatPrice(d.minPurchase) : "—"}</Td>
                  <Td className="text-xs text-ink-500">
                    {d.startDate || d.endDate
                      ? `${d.startDate ?? "…"} تا ${d.endDate ?? "…"}`
                      : "نامحدود"}
                  </Td>
                  <Td className="tabular text-xs">
                    {d.used.toLocaleString("fa-IR")}
                    {d.usageLimit ? ` / ${d.usageLimit}` : ""}
                  </Td>
                  <Td>
                    <span
                      className={`chip text-[11px] ${
                        d.isActive
                          ? "!bg-green-50 !text-green-700"
                          : "!bg-ink-100 !text-ink-500"
                      }`}>
                      {d.isActive ? "فعال" : "غیرفعال"}
                    </span>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <EditButton onClick={() => setEditing(d)} />
                      <DeleteButton onConfirm={() => remove(d.id)} />
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {editing && (
        <DiscountForm
          initial={editing === "new" ? null : editing}
          pending={pending}
          onClose={() => {
            setEditing(null);
            setError(null);
          }}
          onSave={(values) => {
            setError(null);
            startTransition(async () => {
              const r = await saveDiscountAction(
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

function DiscountForm({
  initial,
  pending,
  onClose,
  onSave,
}: {
  initial: DiscountView | null;
  pending: boolean;
  onClose: () => void;
  onSave: (v: Record<string, unknown>) => void;
}) {
  const [v, setV] = useState({ ...EMPTY, ...(initial ?? {}) });
  const num = (s: string) => (s === "" ? null : Number(s));

  return (
    <Modal
      open
      onClose={onClose}
      title={initial ? "ویرایش تخفیف" : "تخفیف جدید"}>
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="کد تخفیف" required>
            <Input
              value={v.code}
              onChange={(e) =>
                setV({ ...v, code: e.target.value.toUpperCase() })
              }
              placeholder="WELCOME"
              className="tabular"
            />
          </Field>
          <Field label="نوع تخفیف" required>
            <Select
              value={v.type}
              onChange={(e) =>
                setV({ ...v, type: e.target.value as "PERCENTAGE" | "FIXED" })
              }>
              <option value="PERCENTAGE">درصدی</option>
              <option value="FIXED">مبلغ ثابت</option>
            </Select>
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {v.type === "PERCENTAGE" ? (
            <Field label="درصد تخفیف" required>
              <Input
                type="number"
                value={v.percentage ?? ""}
                onChange={(e) =>
                  setV({ ...v, percentage: num(e.target.value) })
                }
                className="tabular"
              />
            </Field>
          ) : (
            <Field label="مبلغ تخفیف (تومان)" required>
              <Input
                type="number"
                value={v.fixedAmount ?? ""}
                onChange={(e) =>
                  setV({ ...v, fixedAmount: num(e.target.value) })
                }
                className="tabular"
              />
            </Field>
          )}
          <Field label="سقف تخفیف (تومان)" hint="فقط برای تخفیف درصدی">
            <Input
              type="number"
              value={v.maxDiscount ?? ""}
              onChange={(e) => setV({ ...v, maxDiscount: num(e.target.value) })}
              className="tabular"
            />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="حداقل مبلغ خرید (تومان)">
            <Input
              type="number"
              value={v.minPurchase ?? ""}
              onChange={(e) => setV({ ...v, minPurchase: num(e.target.value) })}
              className="tabular"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="سقف کل مصرف">
              <Input
                type="number"
                value={v.usageLimit ?? ""}
                onChange={(e) =>
                  setV({ ...v, usageLimit: num(e.target.value) })
                }
                className="tabular"
              />
            </Field>
            <Field label="سقف هر کاربر">
              <Input
                type="number"
                value={v.usagePerUser ?? ""}
                onChange={(e) =>
                  setV({ ...v, usagePerUser: num(e.target.value) })
                }
                className="tabular"
              />
            </Field>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="تاریخ شروع">
            <Input
              type="date"
              value={v.startDate ?? ""}
              onChange={(e) =>
                setV({ ...v, startDate: e.target.value || null })
              }
            />
          </Field>
          <Field label="تاریخ پایان">
            <Input
              type="date"
              value={v.endDate ?? ""}
              onChange={(e) => setV({ ...v, endDate: e.target.value || null })}
            />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={v.isActive}
            onChange={(e) => setV({ ...v, isActive: e.target.checked })}
            className="w-4 h-4 accent-brand-500"
          />
          فعال باشد
        </label>

        <div className="flex gap-2 pt-2">
          <button
            onClick={() =>
              onSave({
                code: v.code,
                type: v.type,
                percentage: v.percentage,
                fixedAmount: v.fixedAmount,
                minPurchase: v.minPurchase,
                maxDiscount: v.maxDiscount,
                startDate: v.startDate,
                endDate: v.endDate,
                usageLimit: v.usageLimit,
                usagePerUser: v.usagePerUser,
                isActive: v.isActive,
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

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-right font-medium px-4 py-3">{children}</th>;
}
function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
