"use client";

import { useMemo, useState } from "react";
import {
  AddButton,
  Card,
  DeleteButton,
  EditButton,
  Field,
  Input,
  Modal,
  PageHeader,
  Select,
  TagPicker,
  Textarea,
} from "@/components/admin/AdminUI";
import { useData } from "@/lib/store";
import { formatPrice } from "@/lib/menu";
import { safeUUID } from "@/lib/uuid";
import type { Topping, ToppingCategory } from "@/lib/types";

const CATEGORIES: { id: ToppingCategory; label: string; accent: string }[] = [
  { id: "protein", label: "پروتئین", accent: "bg-rose-50 text-rose-700" },
  { id: "cheese", label: "پنیر", accent: "bg-amber-50 text-amber-700" },
  { id: "veggie", label: "سبزیجات", accent: "bg-emerald-50 text-emerald-700" },
  { id: "sauce", label: "سس", accent: "bg-orange-50 text-orange-700" },
];

function emptyTopping(category: ToppingCategory = "protein"): Topping {
  return {
    id: safeUUID(),
    name: "",
    price: 0,
    category,
    description: "",
    tagIds: [],
  };
}

export default function ToppingsAdmin() {
  const toppings = useData((s) => s.toppings);
  const tags = useData((s) => s.tags);
  const upsert = useData((s) => s.upsertTopping);
  const remove = useData((s) => s.deleteTopping);

  const [editing, setEditing] = useState<Topping | null>(null);
  const [tab, setTab] = useState<ToppingCategory | "all">("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    let list = toppings;
    if (tab !== "all") list = list.filter((t) => t.category === tab);
    if (q.trim()) {
      const s = q.trim();
      list = list.filter((t) => t.name.includes(s));
    }
    return list;
  }, [toppings, tab, q]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="افزودنی‌ها"
        subtitle="پروتئین‌ها، پنیرها، سبزیجات و سس‌ها."
        action={<AddButton onClick={() => setEditing(emptyTopping())} label="افزودنی جدید" />}
      />

      <Card>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-1.5 flex-wrap">
            <TabBtn active={tab === "all"} onClick={() => setTab("all")}>
              همه ({toppings.length})
            </TabBtn>
            {CATEGORIES.map((c) => {
              const count = toppings.filter((t) => t.category === c.id).length;
              return (
                <TabBtn
                  key={c.id}
                  active={tab === c.id}
                  onClick={() => setTab(c.id)}>
                  {c.label} ({count})
                </TabBtn>
              );
            })}
          </div>
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="جستجو..."
            className="!w-auto min-w-[200px]"
          />
        </div>
      </Card>

      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-xs text-ink-500 text-right">
              <tr>
                <th className="px-4 py-3 font-medium">نام</th>
                <th className="px-4 py-3 font-medium">دسته</th>
                <th className="px-4 py-3 font-medium">قیمت</th>
                <th className="px-4 py-3 font-medium">برچسب‌ها</th>
                <th className="px-4 py-3 font-medium w-24 text-left">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const cat = CATEGORIES.find((c) => c.id === t.category);
                return (
                  <tr
                    key={t.id}
                    className="border-t border-ink-100 hover:bg-brand-50/30">
                    <td className="px-4 py-3 font-medium">{t.name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] px-2 py-1 rounded-full ${cat?.accent}`}>
                        {cat?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular font-bold text-brand-600">
                      {formatPrice(t.price)} ت
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {t.tagIds
                          .map((id) => tags.find((x) => x.id === id))
                          .filter(Boolean)
                          .slice(0, 4)
                          .map((tg) => (
                            <span
                              key={tg!.id}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-ink-100 text-ink-700">
                              {tg!.name}
                            </span>
                          ))}
                        {t.tagIds.length > 4 && (
                          <span className="text-[10px] text-ink-400">
                            +{t.tagIds.length - 4}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <EditButton onClick={() => setEditing(t)} />
                        <DeleteButton onConfirm={() => remove(t.id)} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center text-ink-400 py-10">
                    موردی یافت نشد.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {editing && (
        <ToppingForm
          initial={editing}
          allTags={tags}
          onCancel={() => setEditing(null)}
          onSave={(t) => {
            upsert(t);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "px-3 py-1.5 rounded-full text-xs font-bold transition " +
        (active
          ? "bg-brand-500 text-white shadow"
          : "bg-ink-100 text-ink-700 hover:bg-brand-50 hover:text-brand-700")
      }>
      {children}
    </button>
  );
}

function ToppingForm({
  initial,
  allTags,
  onCancel,
  onSave,
}: {
  initial: Topping;
  allTags: { id: string; name: string }[];
  onCancel: () => void;
  onSave: (t: Topping) => void;
}) {
  const [t, setT] = useState<Topping>(initial);
  const set = <K extends keyof Topping>(k: K, v: Topping[K]) =>
    setT((p) => ({ ...p, [k]: v }));

  return (
    <Modal open onClose={onCancel} title="ویرایش افزودنی">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(t);
        }}
        className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="نام" required>
            <Input
              required
              value={t.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </Field>
          <Field label="دسته" required>
            <Select
              required
              value={t.category}
              onChange={(e) =>
                set("category", e.target.value as ToppingCategory)
              }>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="قیمت (تومان)" required>
          <Input
            required
            type="number"
            min={0}
            className="tabular"
            value={t.price}
            onChange={(e) => set("price", Number(e.target.value))}
          />
        </Field>

        <Field label="توضیحات (اختیاری)">
          <Textarea
            rows={2}
            value={t.description ?? ""}
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>

        <Field label="برچسب‌های ذائقه">
          <TagPicker
            allTags={allTags}
            selected={t.tagIds}
            onToggle={(id) =>
              set(
                "tagIds",
                t.tagIds.includes(id)
                  ? t.tagIds.filter((x) => x !== id)
                  : [...t.tagIds, id],
              )
            }
          />
        </Field>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-ink-100">
          <button
            type="button"
            onClick={onCancel}
            className="btn-ghost !py-2 !px-4 text-sm">
            انصراف
          </button>
          <button type="submit" className="btn-primary !py-2 !px-4 text-sm">
            ذخیره
          </button>
        </div>
      </form>
    </Modal>
  );
}
