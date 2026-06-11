"use client";

import { useState, useTransition } from "react";
import {
  PageHeader,
  Card,
  AddButton,
  Modal,
  Field,
  Input,
  EditButton,
  DeleteButton,
} from "@/components/admin/AdminUI";
import { saveCategoryAction, deleteCategoryAction } from "@/app/admin/actions";

type CategoryView = {
  id: string;
  name: string;
  slug: string;
  kind: string;
  sortOrder: number;
  count: number;
};

const KINDS = [
  { value: "bread", label: "نان" },
  { value: "protein", label: "پروتئین" },
  { value: "veggie", label: "سبزیجات" },
  { value: "cheese", label: "پنیر" },
  { value: "sauce", label: "سس" },
  { value: "extra", label: "افزودنی" },
];

export default function CategoriesManager({
  initial,
}: {
  initial: CategoryView[];
}) {
  const [editing, setEditing] = useState<CategoryView | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function remove(id: string) {
    startTransition(async () => {
      const r = await deleteCategoryAction(id);
      if (!r.ok) setError(r.error);
    });
  }

  return (
    <div>
      <PageHeader
        title="دسته‌بندی‌ها"
        subtitle="دسته‌های مواد اولیه: نان، پروتئین، سبزیجات، سس، پنیر، افزودنی‌ها."
        action={
          <AddButton onClick={() => setEditing("new")} label="دسته جدید" />
        }
      />

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5">
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {initial.map((c) => (
          <Card key={c.id} className="flex items-start justify-between">
            <div>
              <div className="font-bold">{c.name}</div>
              <div className="text-xs text-ink-400 mt-1 tabular" dir="ltr">
                {c.slug} · {c.kind}
              </div>
              <div className="text-xs text-ink-500 mt-2">
                {c.count.toLocaleString("fa-IR")} ماده · ترتیب{" "}
                {c.sortOrder.toLocaleString("fa-IR")}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <EditButton onClick={() => setEditing(c)} />
              <DeleteButton onConfirm={() => remove(c.id)} />
            </div>
          </Card>
        ))}
        {initial.length === 0 && (
          <p className="text-ink-400 text-sm">هنوز دسته‌ای تعریف نشده است.</p>
        )}
      </div>

      {editing && (
        <CategoryForm
          initial={editing === "new" ? null : editing}
          pending={pending}
          onClose={() => {
            setEditing(null);
            setError(null);
          }}
          onSave={(values) => {
            setError(null);
            startTransition(async () => {
              const r = await saveCategoryAction(
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

function CategoryForm({
  initial,
  pending,
  onClose,
  onSave,
}: {
  initial: CategoryView | null;
  pending: boolean;
  onClose: () => void;
  onSave: (v: Record<string, unknown>) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [kind, setKind] = useState(initial?.kind ?? "extra");
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);

  return (
    <Modal
      open
      onClose={onClose}
      title={initial ? "ویرایش دسته" : "دسته جدید"}
      width="max-w-md">
      <div className="space-y-4">
        <Field label="نام دسته" required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="سبزیجات"
          />
        </Field>
        <Field label="نامک (انگلیسی)" required hint="حروف کوچک، عدد، خط تیره">
          <Input
            value={slug}
            dir="ltr"
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            placeholder="veggie"
            className="tabular"
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="نوع" required>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className="w-full rounded-xl border border-ink-100 bg-white px-3 py-2.5 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition">
              {KINDS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="ترتیب نمایش">
            <Input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              className="tabular"
            />
          </Field>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => onSave({ name, slug, kind, sortOrder })}
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
