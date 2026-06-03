"use client";

import { useMemo, useState } from "react";
import {
  Card,
  DeleteButton,
  PageHeader,
  Select,
} from "@/components/admin/AdminUI";
import { useData } from "@/lib/store";
import { formatPrice } from "@/lib/menu";
import { StatusPill } from "@/components/admin/StatusPill";
import type { Order, OrderStatus } from "@/lib/types";
import { ChevronDown, ChevronUp } from "lucide-react";

const STATUSES: OrderStatus[] = ["new", "preparing", "delivered", "cancelled"];

export default function OrdersAdmin() {
  const orders = useData((s) => s.orders);
  const setStatus = useData((s) => s.setOrderStatus);
  const remove = useData((s) => s.deleteOrder);

  const [filter, setFilter] = useState<"all" | OrderStatus>("all");

  const list = useMemo(
    () => (filter === "all" ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="سفارش‌ها"
        subtitle="مدیریت سفارش‌های ثبت‌شده توسط مشتری‌ها."
      />

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
          <OrderRow
            key={o.id}
            o={o}
            onStatus={(s) => setStatus(o.id, s)}
            onDelete={() => remove(o.id)}
          />
        ))}
      </div>
    </div>
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

function OrderRow({
  o,
  onStatus,
  onDelete,
}: {
  o: Order;
  onStatus: (s: OrderStatus) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="!p-0 overflow-hidden">
      <div className="flex items-center gap-3 p-4 flex-wrap">
        <button
          onClick={() => setOpen((v) => !v)}
          className="p-1.5 rounded-lg text-ink-500 hover:bg-ink-50">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="font-bold">{o.customer.name}</div>
          <div className="text-xs text-ink-500 tabular">
            {o.customer.phone} ·{" "}
            {new Date(o.date).toLocaleString("fa-IR")}
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
          <span className="price text-brand-700">
            {formatPrice(o.total)} ت
          </span>
        </div>
        <Select
          value={o.status}
          onChange={(e) => onStatus(e.target.value as OrderStatus)}
          className="!w-auto !py-1.5 text-xs">
          <option value="new">جدید</option>
          <option value="preparing">در حال آماده‌سازی</option>
          <option value="delivered">تحویل شد</option>
          <option value="cancelled">لغو شد</option>
        </Select>
        <StatusPill status={o.status} />
        <DeleteButton onConfirm={onDelete} />
      </div>

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
                      {it.sandwichName} × {it.qty}
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
            <Info label="نوع سفارش" value={o.customer.method === "delivery" ? "ارسال" : "حضوری"} />
            <Info label="آدرس" value={o.customer.address ?? "—"} />
            <Info label="یادداشت" value={o.customer.note ?? "—"} />
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
                {formatPrice(o.delivery)} ت
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
