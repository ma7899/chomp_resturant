"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { cartTotal, lineTotal, useCart } from "@/lib/cart";
import { formatPrice, getSandwich, getTopping } from "@/lib/menu";
import { ArrowLeft, Check, ShieldAlert } from "lucide-react";
import { placeOrderAction, type CheckoutResult } from "./actions";

type CheckoutAddress = {
  id: string;
  title: string;
  text: string;
  isDefault: boolean;
};

type CheckoutProfile = {
  authed: boolean;
  user?: { name: string; phone: string };
  addresses?: CheckoutAddress[];
};

export default function CheckoutPage() {
  const { items, clear } = useCart();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allergyWarning, setAllergyWarning] = useState<string[]>([]);
  const [acceptAllergyRisk, setAcceptAllergyRisk] = useState(false);
  const [profile, setProfile] = useState<CheckoutProfile>({ authed: false });
  const [profileLoading, setProfileLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    selectedAddressId: "",
    note: "",
    method: "delivery",
  });

  useEffect(() => {
    let cancelled = false;
    async function loadProfile() {
      try {
        const res = await fetch("/api/account/checkout-profile", {
          method: "GET",
          cache: "no-store",
        });
        const data = (await res.json()) as CheckoutProfile;
        if (cancelled || !res.ok) return;

        const addresses = data.addresses ?? [];
        const defaultAddress =
          addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;

        setProfile(data);
        setForm((prev) => ({
          ...prev,
          name: data.user?.name || prev.name,
          phone: data.user?.phone || prev.phone,
          selectedAddressId: defaultAddress?.id ?? "",
          address: defaultAddress?.text ?? prev.address,
        }));
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    }
    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const addresses = profile.addresses ?? [];
  const selectedAddress =
    addresses.find((a) => a.id === form.selectedAddressId) ?? null;
  const hasSavedAddress = addresses.length > 0;
  const requireAddressCreation =
    profile.authed && form.method === "delivery" && !hasSavedAddress;

  useEffect(() => {
    if (selectedAddress) {
      setForm((prev) => ({ ...prev, address: selectedAddress.text }));
    }
  }, [selectedAddress]);

  const total = cartTotal(items);
  const delivery = form.method === "delivery" ? 50 : 0;
  const grand = total + delivery;

  const canSubmit = useMemo(() => {
    if (submitting || profileLoading) return false;
    if (form.method === "delivery" && requireAddressCreation) return false;
    if (form.method === "delivery" && profile.authed && hasSavedAddress) {
      return !!form.selectedAddressId;
    }
    return true;
  }, [
    submitting,
    profileLoading,
    form.method,
    requireAddressCreation,
    profile.authed,
    hasSavedAddress,
    form.selectedAddressId,
  ]);

  if (submitted) {
    return (
      <div className="container-x py-20 text-center max-w-lg mx-auto">
        <div className="w-20 h-20 rounded-full bg-brand-500 text-white mx-auto flex items-center justify-center mb-6">
          <Check size={36} />
        </div>
        <h1 className="heading text-3xl font-black">سفارش شما ثبت شد!</h1>
        <p className="text-ink-500 mt-3 leading-7">
          ممنون که چامپ رو انتخاب کردی. به زودی با شماره شما تماس می گیریم.
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

  async function submitOrder(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const result: CheckoutResult = await placeOrderAction({
      items: items.map((it) => ({
        sandwichSlug: it.sandwichSlug,
        toppingIds: it.toppingIds,
        qty: it.qty,
        customSandwichId: it.customSandwichId ?? null,
      })),
      method: form.method,
      name: form.name,
      phone: form.phone,
      addressId:
        form.method === "delivery" && hasSavedAddress
          ? form.selectedAddressId || null
          : null,
      addressText:
        form.method === "delivery"
          ? hasSavedAddress
            ? selectedAddress?.text || null
            : form.address || null
          : null,
      note: form.note || null,
      confirmAllergyWarning: acceptAllergyRisk,
    });

    if (!result.ok) {
      setError(result.error);
      if (result.code === "ALLERGY_CONFLICT") {
        setAllergyWarning(result.allergens ?? []);
      }
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    clear();
    setSubmitting(false);
  }

  return (
    <div className="container-x py-10 md:py-16 grid lg:grid-cols-[1fr_400px] gap-8">
      <form onSubmit={submitOrder} className="space-y-6">
        <header>
          <span className="chip">ثبت سفارش</span>
          <h1 className="heading text-3xl md:text-4xl font-black mt-2">
            اطلاعات تحویل
          </h1>
        </header>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
            {error}
          </div>
        )}

        {allergyWarning.length > 0 && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
              <ShieldAlert size={18} /> هشدار حساسیت
            </div>
            <p className="text-sm text-amber-900 mt-2 leading-6">
              این سفارش شامل مواد حساسیت زا است:
              <span className="font-semibold"> {allergyWarning.join("، ")}</span>
            </p>
            <label className="mt-3 flex items-center gap-2 text-sm text-amber-900">
              <input
                type="checkbox"
                checked={acceptAllergyRisk}
                onChange={(ev) => setAcceptAllergyRisk(ev.target.checked)}
                className="w-4 h-4 accent-amber-600"
              />
              آگاه هستم و با مسئولیت خودم ادامه می دهم.
            </label>
          </div>
        )}

        <div className="rounded-3xl bg-white border border-ink-100 p-5 md:p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="نام و نام خانوادگی" required>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
                placeholder="مثلا علی رضایی"
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
            <>
              {profile.authed && hasSavedAddress && (
                <Field label="آدرس ذخیره شده" required>
                  <select
                    required
                    value={form.selectedAddressId}
                    onChange={(e) =>
                      setForm({ ...form, selectedAddressId: e.target.value })
                    }
                    className="input">
                    <option value="">انتخاب آدرس</option>
                    {addresses.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title} - {a.text}
                      </option>
                    ))}
                  </select>
                </Field>
              )}

              {requireAddressCreation && (
                <div className="rounded-2xl bg-ink-50 border border-ink-200 p-4">
                  <p className="text-sm text-ink-700">
                    برای ادامه checkout باید ابتدا آدرس ثبت کنید.
                  </p>
                  <Link
                    href="/dashboard/addresses"
                    className="btn-primary mt-3 inline-flex !py-2 !px-4 text-sm">
                    افزودن آدرس
                  </Link>
                </div>
              )}

              {!profile.authed && (
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
            </>
          )}

          <Field label="یادداشت (اختیاری)">
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              rows={2}
              className="input"
              placeholder="مثلا بدون سس، یا حساسیت غذایی"
            />
          </Field>
        </div>

        <button type="submit" disabled={!canSubmit} className="btn-primary w-full disabled:opacity-50">
          {submitting ? "در حال ثبت..." : `ثبت نهایی سفارش - ${formatPrice(grand)} تومان`}
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
            const title = item.customName || s?.name || "ساندویچ سفارشی";
            return (
              <div
                key={item.id}
                className="border-b border-ink-100 pb-3 last:border-0">
                <div className="flex items-start justify-between text-sm">
                  <span className="font-bold">
                    {title} × {item.qty}
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
          <Row label="جمع آیتم ها" value={`${formatPrice(total)} تومان`} />
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
