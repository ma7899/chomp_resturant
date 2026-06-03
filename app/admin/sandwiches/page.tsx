"use client";

import { useState } from "react";
import Image from "next/image";
import {
  AddButton,
  Card,
  DeleteButton,
  EditButton,
  Field,
  Input,
  Modal,
  PageHeader,
  TagPicker,
  Textarea,
} from "@/components/admin/AdminUI";
import { useData } from "@/lib/store";
import { formatPrice } from "@/lib/menu";
import { safeUUID } from "@/lib/uuid";
import type { Sandwich } from "@/lib/types";

function emptySandwich(): Sandwich {
  return {
    id: safeUUID(),
    slug: "",
    name: "",
    tagline: "",
    description: "",
    basePrice: 0,
    includedIngredients: [],
    image: "/images/roastbeef.png",
    tagIds: [],
  };
}

export default function SandwichesAdmin() {
  const sandwiches = useData((s) => s.sandwiches);
  const tags = useData((s) => s.tags);
  const upsert = useData((s) => s.upsertSandwich);
  const remove = useData((s) => s.deleteSandwich);

  const [editing, setEditing] = useState<Sandwich | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="ساندویچ‌ها"
        subtitle="مدیریت کامل ساندویچ‌های منوی چاپ — ایجاد، ویرایش و حذف."
        action={<AddButton onClick={() => setEditing(emptySandwich())} label="ساندویچ جدید" />}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sandwiches.map((s) => (
          <Card key={s.id}>
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-brand-50 mb-4">
              <Image
                src={s.image}
                alt={s.name}
                fill
                sizes="33vw"
                className="object-cover"
              />
              {s.badge && (
                <span className="absolute top-2 right-2 chip !bg-brand-500 !text-white">
                  {s.badge}
                </span>
              )}
            </div>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-bold truncate">{s.name}</h3>
                <p className="text-xs text-ink-500 mt-1 line-clamp-2">
                  {s.tagline}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <EditButton onClick={() => setEditing(s)} />
                <DeleteButton onConfirm={() => remove(s.id)} />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="price text-brand-600">
                {formatPrice(s.basePrice)} ت
              </span>
              <span className="text-[10px] text-ink-400 tabular">
                /{s.slug}
              </span>
            </div>
            {s.tagIds.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {s.tagIds
                  .map((id) => tags.find((t) => t.id === id))
                  .filter(Boolean)
                  .slice(0, 4)
                  .map((t) => (
                    <span
                      key={t!.id}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
                      {t!.name}
                    </span>
                  ))}
              </div>
            )}
          </Card>
        ))}
        {sandwiches.length === 0 && (
          <Card className="sm:col-span-2 lg:col-span-3 text-center text-ink-400 py-12">
            هیچ ساندویچی ثبت نشده. با دکمه‌ی «ساندویچ جدید» شروع کنید.
          </Card>
        )}
      </div>

      {editing && (
        <SandwichForm
          initial={editing}
          allTags={tags}
          onCancel={() => setEditing(null)}
          onSave={(s) => {
            upsert(s);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function SandwichForm({
  initial,
  allTags,
  onCancel,
  onSave,
}: {
  initial: Sandwich;
  allTags: { id: string; name: string }[];
  onCancel: () => void;
  onSave: (s: Sandwich) => void;
}) {
  const [s, setS] = useState<Sandwich>(initial);
  const [ingRaw, setIngRaw] = useState(initial.includedIngredients.join("، "));

  const set = <K extends keyof Sandwich>(k: K, v: Sandwich[K]) =>
    setS((prev) => ({ ...prev, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const slug =
      (s.slug.trim() ||
        s.name
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")) || s.id;
    onSave({
      ...s,
      slug,
      includedIngredients: ingRaw
        .split(/،|,/)
        .map((x) => x.trim())
        .filter(Boolean),
    });
  };

  return (
    <Modal open onClose={onCancel} title="ویرایش ساندویچ">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="نام" required>
            <Input
              required
              value={s.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="ساندویچ رست بیف"
            />
          </Field>
          <Field label="Slug (آدرس)" hint="از حروف انگلیسی و خط تیره استفاده کنید">
            <Input
              value={s.slug}
              onChange={(e) => set("slug", e.target.value)}
              placeholder="roast-beef"
              dir="ltr"
            />
          </Field>
        </div>

        <Field label="شعار کوتاه">
          <Input
            value={s.tagline}
            onChange={(e) => set("tagline", e.target.value)}
            placeholder="پادشاه منوی چاپ"
          />
        </Field>

        <Field label="توضیحات" required>
          <Textarea
            required
            rows={3}
            value={s.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="قیمت پایه (تومان)" required>
            <Input
              required
              type="number"
              min={0}
              className="tabular"
              value={s.basePrice}
              onChange={(e) => set("basePrice", Number(e.target.value))}
            />
          </Field>
          <Field label="نشان (badge) اختیاری">
            <Input
              value={s.badge ?? ""}
              onChange={(e) =>
                set("badge", e.target.value ? e.target.value : undefined)
              }
              placeholder="مثلاً پرفروش"
            />
          </Field>
        </div>

        <Field
          label="مواد تشکیل‌دهنده"
          hint="با ویرگول فارسی (،) یا انگلیسی (,) جدا کنید">
          <Textarea
            rows={2}
            value={ingRaw}
            onChange={(e) => setIngRaw(e.target.value)}
            placeholder="رست بیف، سس بالزامیک، کاهو و پیازچه"
          />
        </Field>

        <Field label="مسیر تصویر" hint="مسیر نسبی در public/ یا URL کامل">
          <Input
            value={s.image}
            onChange={(e) => set("image", e.target.value)}
            placeholder="/images/roastbeef.png"
            dir="ltr"
          />
        </Field>

        {s.image && (
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-ink-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.image}
              alt="preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <Field label="برچسب‌های ذائقه">
          <TagPicker
            allTags={allTags}
            selected={s.tagIds}
            onToggle={(id) =>
              set(
                "tagIds",
                s.tagIds.includes(id)
                  ? s.tagIds.filter((x) => x !== id)
                  : [...s.tagIds, id],
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
