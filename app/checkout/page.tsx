"use client";

import Link from "next/link";
import { useState } from "react";
import { cartTotal, lineTotal, useCart } from "@/lib/cart";
import { formatPrice, getSandwich, getTopping } from "@/lib/menu";
import { useData } from "@/lib/store";
import { ArrowLeft, Check } from "lucide-react";

export default function CheckoutPage() {
  const { items, clear } = useCart();
  const addOrder = useData((s) => s.addOrder);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
    method: "delivery",
  });

  const total = cartTotal(items);
  const delivery = form.method === "delivery" ? 50 : 0;
  const grand = total + delivery;

  if (submitted) {
    return (
      <div className="container-x py-20 text-center max-w-lg mx-auto">
        <div className="w-20 h-20 rounded-full bg-brand-500 text-white mx-auto flex items-center justify-center mb-6">
          <Check size={36} />
        </div>
        <h1 className="heading text-3xl font-black">سفارش شما ثبت شد!</h1>
        <p className="text-ink-500 mt-3 leading-7">
          ممنون که چامپ رو انتخاب کردی. به‌زودی با شماره‌ی شما تماس می‌گیریم.
        </p>
        <Link href="/" className="btn-primary mt-8 inline-flex">
          بازگشت به خانه
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-x py-20 text-center">
        <h1 className="heading text-2xl font-black">سبد خرید خالی است</h1>
        <Link href="/menu" className="btn-primary mt-6 inline-flex">
          مشاهده منو
        </Link>
      </div>
    );
  }

  return (
    <div className="container-x py-10 md:py-16 grid lg:grid-cols-[1fr_400px] gap-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          // Persist order to the data store so the admin dashboard can
          // see purchases and the user keeps a fresh, empty cart.
          const orderItems = items.map((it) => {
            const s = getSandwich(it.sandwichSlug);
            const toppings = it.toppingIds
              .map((id) => getTopping(id))
              .filter((t): t is NonNullable<typeof t> => !!t);
            const unit =
              (s?.basePrice ?? 0) +
              toppings.reduce((sum, t) => sum + t.price, 0);
            return {
              sandwichSlug: it.sandwichSlug,
              sandwichName: s?.name ?? "—",
              toppingIds: it.toppingIds,
              toppingNames: toppings.map((t) => t.name),
              qty: it.qty,
              unitPrice: unit,
              lineTotal: unit * it.qty,
            };
          });
          addOrder({
            items: orderItems,
            subtotal: total,
            delivery,
            total: grand,
            customer: {
              name: form.name,
              phone: form.phone,
              address: form.method === "delivery" ? form.address : undefined,
              note: form.note || undefined,
              method: form.method as "delivery" | "pickup",
            },
          });
          setSubmitted(true);
          clear();
        }}
        className="space-y-6">
        <header>
          <span className="chip">ثبت سفارش</span>
          <h1 className="heading text-3xl md:text-4xl font-black mt-2">
            اطلاعات تحویل
          </h1>
        </header>

        <div className="rounded-3xl bg-white border border-ink-100 p-5 md:p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="نام و نام خانوادگی" required>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
                placeholder="مثلاً علی رضایی"
              />
            </Field>
            <Field label="شماره تماس" required>
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input tabular"
                placeholder="0912xxxxxxx"
              />
            </Field>
          </div>

          <Field label="نوع سفارش">
            <div className="grid grid-cols-2 gap-3">
              {[
                { v: "delivery", t: "ارسال به آدرس", d: "هزینه ۵۰ تومان" },
                { v: "pickup", t: "تحویل حضوری", d: "بدون هزینه" },
              ].map((m) => (
                <label
                  key={m.v}
                  className={`cursor-pointer rounded-2xl border-2 p-4 transition ${
                    form.method === m.v
                      ? "border-brand-500 bg-brand-50"
                      : "border-ink-100"
                  }`}>
                  <input
                    type="radio"
                    name="method"
                    className="hidden"
                    checked={form.method === m.v}
                    onChange={() => setForm({ ...form, method: m.v })}
                  />
                  <div className="font-bold text-sm">{m.t}</div>
                  <div className="text-xs text-ink-500 mt-1">{m.d}</div>
                </label>
              ))}
            </div>
          </Field>

          {form.method === "delivery" && (
            <Field label="آدرس کامل" required>
              <textarea
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={3}
                className="input"
                placeholder="خیابان، کوچه، پلاک، واحد..."
              />
            </Field>
          )}

          <Field label="یادداشت (اختیاری)">
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              rows={2}
              className="input"
              placeholder="مثلاً بدون سس، یا حساسیت غذایی"
            />
          </Field>
        </div>

        <button type="submit" className="btn-primary w-full">
          ثبت نهایی سفارش — {formatPrice(grand)} تومان
          <ArrowLeft size={18} />
        </button>

        <style jsx>{`
          .input {
            width: 100%;
            border-radius: 14px;
            border: 1px solid #e7e7e7;
            padding: 12px 14px;
            background: #fff;
            font: inherit;
            transition:
              border 0.2s,
              box-shadow 0.2s;
          }
          .input:focus {
            outline: none;
            border-color: #f56a16;
            box-shadow: 0 0 0 3px rgba(245, 106, 22, 0.15);
          }
        `}</style>
      </form>

      <aside className="lg:sticky lg:top-24 h-fit rounded-3xl bg-white border border-ink-100 overflow-hidden">
        <div className="p-5 bg-ink-900 text-white">
          <h2 className="font-bold">خلاصه سفارش</h2>
        </div>
        <div className="p-5 space-y-3 max-h-[50vh] overflow-y-auto">
          {items.map((item) => {
            const s = getSandwich(item.sandwichSlug);
            if (!s) return null;
            return (
              <div
                key={item.id}
                className="border-b border-ink-100 pb-3 last:border-0">
                <div className="flex items-start justify-between text-sm">
                  <span className="font-bold">
                    {s.name} × {item.qty}
                  </span>
                  <span className="tabular font-bold">
                    {formatPrice(lineTotal(item))}
                  </span>
                </div>
                {item.toppingIds.length > 0 && (
                  <p className="text-[11px] text-ink-500 mt-1 leading-5">
                    {item.toppingIds
                      .map((id) => getTopping(id)?.name)
                      .filter(Boolean)
                      .join("، ")}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <div className="p-5 border-t border-ink-100 space-y-2 text-sm">
          <Row label="جمع آیتم‌ها" value={`${formatPrice(total)} تومان`} />
          <Row label="هزینه ارسال" value={`${formatPrice(delivery)} تومان`} />
          <Row label="مبلغ نهایی" value={`${formatPrice(grand)} تومان`} big />
        </div>
      </aside>
    </div>
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

function Row({
  label,
  value,
  big,
}: {
  label: string;
  value: string;
  big?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={big ? "font-bold" : "text-ink-500"}>{label}</span>
      <span
        className={`tabular ${big ? "text-lg font-black text-brand-700" : "font-bold"}`}>
        {value}
      </span>
    </div>
  );
}
