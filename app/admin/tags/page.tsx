"use client";

import { useState } from "react";
import {
  AddButton,
  Card,
  DeleteButton,
  EditButton,
  Field,
  Input,
  Modal,
  PageHeader,
} from "@/components/admin/AdminUI";
import { useData } from "@/lib/store";
import { safeUUID } from "@/lib/uuid";
import type { Tag } from "@/lib/types";

export default function TagsAdmin() {
  const tags = useData((s) => s.tags);
  const sandwiches = useData((s) => s.sandwiches);
  const toppings = useData((s) => s.toppings);
  const upsert = useData((s) => s.upsertTag);
  const remove = useData((s) => s.deleteTag);

  const [editing, setEditing] = useState<Tag | null>(null);

  const usage = (id: string) =>
    sandwiches.filter((s) => s.tagIds.includes(id)).length +
    toppings.filter((t) => t.tagIds.includes(id)).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="برچسب‌های ذائقه"
        subtitle="برچسب‌هایی که برای دسته‌بندی طعم و توصیه ساندویچ به مشتری استفاده می‌شوند."
        action={
          <AddButton
            onClick={() =>
              setEditing({ id: safeUUID(), name: "", color: "brand" })
            }
            label="برچسب جدید"
          />
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {tags.map((t) => {
          const u = usage(t.id);
          return (
            <Card key={t.id} className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-brand-500" />
                  <span className="font-bold truncate">{t.name}</span>
                </div>
                <p className="text-[11px] text-ink-500 mt-1">
                  {u > 0 ? `${u} آیتم از این برچسب استفاده می‌کند` : "بدون استفاده"}
                </p>
              </div>
              <div className="flex gap-1">
                <EditButton onClick={() => setEditing(t)} />
                <DeleteButton onConfirm={() => remove(t.id)} />
              </div>
            </Card>
          );
        })}
        {tags.length === 0 && (
          <Card className="sm:col-span-2 lg:col-span-3 text-center text-ink-400 py-12">
            هنوز برچسبی تعریف نشده. اولین برچسب را اضافه کنید.
          </Card>
        )}
      </div>

      {editing && (
        <TagForm
          initial={editing}
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

function TagForm({
  initial,
  onCancel,
  onSave,
}: {
  initial: Tag;
  onCancel: () => void;
  onSave: (t: Tag) => void;
}) {
  const [t, setT] = useState<Tag>(initial);
  return (
    <Modal open onClose={onCancel} title="ویرایش برچسب" width="max-w-md">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!t.name.trim()) return;
          onSave({ ...t, name: t.name.trim() });
        }}
        className="space-y-4">
        <Field label="نام برچسب" required>
          <Input
            required
            value={t.name}
            onChange={(e) => setT({ ...t, name: e.target.value })}
            placeholder="مثلاً تند"
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
