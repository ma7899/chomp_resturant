"use client";

import { useState } from "react";
import {
  AddButton,
  Card,
  DeleteButton,
  Field,
  Input,
  PageHeader,
  Select,
  TagPicker,
  Textarea,
} from "@/components/admin/AdminUI";
import { useData } from "@/lib/store";
import { safeUUID } from "@/lib/uuid";
import type { Question, QuestionOption, QuestionType } from "@/lib/types";
import { ChevronDown, ChevronUp, Plus, Trash2, Wand2 } from "lucide-react";

const TYPE_LABEL: Record<QuestionType, string> = {
  single: "تک‌انتخابی",
  multi: "چندانتخابی",
  scale: "شدت / مقیاس",
};

export default function TasteFormAdmin() {
  const form = useData((s) => s.tasteForm);
  const tags = useData((s) => s.tags);
  const setTasteForm = useData((s) => s.setTasteForm);
  const upsertQuestion = useData((s) => s.upsertQuestion);
  const deleteQuestion = useData((s) => s.deleteQuestion);

  const addQuestion = () =>
    upsertQuestion({
      id: safeUUID(),
      text: "سؤال جدید",
      type: "single",
      options: [
        { id: safeUUID(), label: "گزینه ۱", tagBoosts: [] },
        { id: safeUUID(), label: "گزینه ۲", tagBoosts: [] },
      ],
    });

  return (
    <div className="space-y-6">
      <PageHeader
        title="طراحی فرم ذائقه‌سنج"
        subtitle="با چینش سؤال‌ها و وزن‌دهی به برچسب‌ها، موتور پیشنهاد ساندویچ را آموزش دهید."
        action={<AddButton onClick={addQuestion} label="سؤال جدید" />}
      />

      <Card>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="عنوان فرم">
            <Input
              value={form.title}
              onChange={(e) =>
                setTasteForm({ ...form, title: e.target.value })
              }
            />
          </Field>
          <Field label="پیام معرفی">
            <Input
              value={form.intro}
              onChange={(e) =>
                setTasteForm({ ...form, intro: e.target.value })
              }
            />
          </Field>
        </div>
      </Card>

      <div className="space-y-3">
        {form.questions.map((q, i) => (
          <QuestionEditor
            key={q.id}
            index={i}
            q={q}
            allTags={tags}
            onChange={(next) => upsertQuestion(next)}
            onDelete={() => deleteQuestion(q.id)}
          />
        ))}
        {form.questions.length === 0 && (
          <Card className="text-center text-ink-400 py-12">
            <Wand2 className="mx-auto mb-3 opacity-50" />
            هنوز سؤالی تعریف نشده. اولین سؤال را اضافه کنید.
          </Card>
        )}
      </div>
    </div>
  );
}

function QuestionEditor({
  q,
  index,
  allTags,
  onChange,
  onDelete,
}: {
  q: Question;
  index: number;
  allTags: { id: string; name: string }[];
  onChange: (q: Question) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(true);

  const setOpt = (id: string, next: Partial<QuestionOption>) =>
    onChange({
      ...q,
      options: q.options.map((o) => (o.id === id ? { ...o, ...next } : o)),
    });

  const addOpt = () =>
    onChange({
      ...q,
      options: [
        ...q.options,
        { id: safeUUID(), label: `گزینه ${q.options.length + 1}`, tagBoosts: [] },
      ],
    });

  const removeOpt = (id: string) =>
    onChange({ ...q, options: q.options.filter((o) => o.id !== id) });

  return (
    <Card>
      <header className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <button
            onClick={() => setOpen((v) => !v)}
            className="p-1.5 rounded-lg text-ink-500 hover:bg-ink-50">
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={q.type}
            onChange={(e) =>
              onChange({ ...q, type: e.target.value as QuestionType })
            }
            className="!w-auto !py-1.5 text-xs">
            {Object.entries(TYPE_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
          <DeleteButton onConfirm={onDelete} />
        </div>
      </header>

      <Field label="متن سؤال">
        <Input
          value={q.text}
          onChange={(e) => onChange({ ...q, text: e.target.value })}
        />
      </Field>

      <Field label="توضیح کوتاه (اختیاری)">
        <Input
          value={q.help ?? ""}
          onChange={(e) => onChange({ ...q, help: e.target.value })}
        />
      </Field>

      {open && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-ink-500">گزینه‌ها</h4>
            <button
              onClick={addOpt}
              className="text-xs text-brand-600 hover:underline inline-flex items-center gap-1">
              <Plus size={12} /> گزینه جدید
            </button>
          </div>
          <div className="space-y-3">
            {q.options.map((o, i) => (
              <div
                key={o.id}
                className="rounded-2xl border border-ink-100 bg-ink-50/30 p-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-ink-400 tabular w-5 text-center">
                    {i + 1}
                  </span>
                  <Input
                    value={o.label}
                    onChange={(e) => setOpt(o.id, { label: e.target.value })}
                    placeholder="متن گزینه"
                  />
                  <button
                    onClick={() => removeOpt(o.id)}
                    className="p-1.5 rounded-lg text-ink-400 hover:text-red-600 hover:bg-red-50">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="mt-2 pr-7">
                  <p className="text-[11px] text-ink-500 mb-1.5">
                    این گزینه چه برچسب‌هایی را تقویت می‌کند؟
                  </p>
                  <TagPicker
                    allTags={allTags}
                    selected={o.tagBoosts.map((b) => b.tagId)}
                    onToggle={(id) => {
                      const has = o.tagBoosts.find((b) => b.tagId === id);
                      setOpt(o.id, {
                        tagBoosts: has
                          ? o.tagBoosts.filter((b) => b.tagId !== id)
                          : [...o.tagBoosts, { tagId: id, weight: 1 }],
                      });
                    }}
                  />
                  {o.tagBoosts.length > 0 && (
                    <div className="mt-3 grid sm:grid-cols-2 gap-2">
                      {o.tagBoosts.map((b) => {
                        const tag = allTags.find((t) => t.id === b.tagId);
                        if (!tag) return null;
                        return (
                          <label
                            key={b.tagId}
                            className="flex items-center gap-2 text-xs bg-white rounded-lg border border-ink-100 px-2 py-1.5">
                            <span className="flex-1 truncate">{tag.name}</span>
                            <span className="text-[10px] text-ink-400">
                              وزن
                            </span>
                            <input
                              type="number"
                              min={1}
                              max={5}
                              value={b.weight}
                              onChange={(e) =>
                                setOpt(o.id, {
                                  tagBoosts: o.tagBoosts.map((x) =>
                                    x.tagId === b.tagId
                                      ? {
                                          ...x,
                                          weight: Math.max(
                                            1,
                                            Number(e.target.value) || 1,
                                          ),
                                        }
                                      : x,
                                  ),
                                })
                              }
                              className="w-12 rounded border border-ink-200 px-1 py-0.5 text-center tabular"
                            />
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
