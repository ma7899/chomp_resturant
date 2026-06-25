"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/admin/AdminUI";
import { StatusPill } from "@/components/admin/StatusPill";
import { formatPrice } from "@/lib/format";
import { changeOrderStatusAction } from "@/app/admin/actions";
import type { OrderStatus } from "@prisma/client";

const STATUSES: OrderStatus[] = ["NEW", "PREPARING", "DELIVERED", "CANCELLED"];

export type OrdersClientProps = {
  orders: {
    id: string;
    customerName: string;
    customerPhone: string;
    createdAt: Date;
    total: number;
    status: OrderStatus;
    method: string;
    addressText: string | null;
    note: string | null;
    subtotal: number;
    deliveryFee: number;
    items: {
      id: string;
      name: string;
      qty: number;
      lineTotal: number;
      toppingNames: string[];
    }[];
  }[];
};

export function OrdersClient({ orders }: OrdersClientProps) {
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");

  const list =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <>
      <Card>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={pill(filter === "all")}>
            همه ({orders.length})
          </button>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={pill(filter === s)}>
              <StatusPill status={s} />{" "}
              <span className="tabular text-ink-500 mr-1">
                {orders.filter((o) => o.status === s).length}
              </span>
            </button>
          ))}
        </div>
      </Card>

      <div className="space-y-3">
        {list.length === 0 && (
          <Card className="text-center text-ink-400 py-12">
            سفارشی برای نمایش وجود ندارد.
          </Card>
        )}
        {list.map((o) => (
          <OrderRow key={o.id} o={o} />
        ))}
      </div>
    </>
  );
}

function pill(active: boolean) {
  return (
    "px-3 py-1.5 rounded-full text-xs font-bold transition border " +
    (active
      ? "bg-brand-50 border-brand-300 text-brand-700"
      : "bg-white border-ink-100 text-ink-600 hover:border-brand-200")
  );
}

function OrderRow({ o }: { o: OrdersClientProps["orders"][0] }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<OrderStatus>(o.status);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleStatusChange(next: OrderStatus) {
    if (next === status) return;
    setError(null);
    startTransition(async () => {
      const res = await changeOrderStatusAction(o.id, next);
      if (res.ok) {
        setStatus(next);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <Card className="!p-0 overflow-hidden">
      <div className="flex items-center gap-3 p-4 flex-wrap">
        <button
          onClick={() => setOpen((v) => !v)}
          className="p-1.5 rounded-lg text-ink-500 hover:bg-ink-50">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="font-bold">{o.customerName}</div>
          <div className="text-xs text-ink-500 tabular">
            {o.customerPhone} · {new Date(o.createdAt).toLocaleString("fa-IR")}
          </div>
        </div>
        <div className="text-sm">
          <span className="text-ink-500">آیتم: </span>
          <span className="font-bold tabular">
            {o.items.reduce((s, i) => s + i.qty, 0)}
          </span>
        </div>
        <div className="text-sm">
          <span className="text-ink-500">مبلغ: </span>
          <span className="price text-brand-700">{formatPrice(o.total)} ت</span>
        </div>
        <StatusSelect
          value={status}
          onChange={handleStatusChange}
          disabled={pending}
        />
      </div>
      {error && (
        <p className="text-xs text-red-600 px-4 pb-2">{error}</p>
      )}

      {open && (
        <div className="border-t border-ink-100 bg-ink-50/30 p-4 space-y-3">
          <div>
            <h4 className="text-xs font-bold text-ink-500 mb-2">اقلام</h4>
            <ul className="space-y-2">
              {o.items.map((it, i) => (
                <li
                  key={i}
                  className="bg-white rounded-xl border border-ink-100 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold">
                      {it.name} × {it.qty}
                    </span>
                    <span className="tabular font-bold text-brand-700">
                      {formatPrice(it.lineTotal)} ت
                    </span>
                  </div>
                  {it.toppingNames.length > 0 && (
                    <p className="text-[11px] text-ink-500 mt-1 leading-6">
                      افزودنی‌ها: {it.toppingNames.join("، ")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 text-xs">
            <Info
              label="نوع سفارش"
              value={o.method === "DELIVERY" ? "ارسال" : "حضوری"}
            />
            <Info label="آدرس" value={o.addressText ?? "—"} />
            <Info label="یادداشت" value={o.note ?? "—"} />
          </div>

          <div className="flex items-center justify-end gap-4 text-sm pt-2 border-t border-ink-100">
            <span className="text-ink-500">
              جمع آیتم‌ها:{" "}
              <span className="font-bold tabular text-ink-900">
                {formatPrice(o.subtotal)} ت
              </span>
            </span>
            <span className="text-ink-500">
              ارسال:{" "}
              <span className="font-bold tabular text-ink-900">
                {formatPrice(o.deliveryFee)} ت
              </span>
            </span>
            <span className="price text-brand-700 text-lg">
              {formatPrice(o.total)} ت
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-ink-100 p-3">
      <div className="text-[10px] text-ink-400">{label}</div>
      <div className="font-medium mt-0.5 leading-6 break-words">{value}</div>
    </div>
  );
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: "جدید",
  PREPARING: "در حال آماده‌سازی",
  DELIVERED: "تحویل داده شده",
  CANCELLED: "لغو شده",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  NEW: "border-blue-300 bg-blue-50 text-blue-700",
  PREPARING: "border-yellow-300 bg-yellow-50 text-yellow-700",
  DELIVERED: "border-green-300 bg-green-50 text-green-700",
  CANCELLED: "border-red-300 bg-red-50 text-red-700",
};

function StatusSelect({
  value,
  onChange,
  disabled,
}: {
  value: OrderStatus;
  onChange: (s: OrderStatus) => void;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as OrderStatus)}
      className={`text-xs font-bold rounded-full px-3 py-1.5 border cursor-pointer appearance-none outline-none transition disabled:opacity-60 ${STATUS_COLORS[value]}`}>
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
