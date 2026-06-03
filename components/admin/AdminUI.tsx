"use client";

import clsx from "clsx";
import { useState } from "react";
import { Edit2, Plus, Trash2, X } from "lucide-react";

/* ───────── Field primitives ───────── */

export function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink-700">
        {label} {required && <span className="text-brand-600">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="text-[11px] text-ink-400 mt-1">{hint}</p>}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        "w-full rounded-xl border border-ink-100 bg-white px-3 py-2.5 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition",
        props.className,
      )}
    />
  );
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className={clsx(
        "w-full rounded-xl border border-ink-100 bg-white px-3 py-2.5 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition leading-7",
        props.className,
      )}
    />
  );
}

export function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement>,
) {
  return (
    <select
      {...props}
      className={clsx(
        "w-full rounded-xl border border-ink-100 bg-white px-3 py-2.5 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition",
        props.className,
      )}
    />
  );
}

/* ───────── Page header ───────── */

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
      <div>
        <h1 className="heading text-2xl md:text-3xl font-black">{title}</h1>
        {subtitle && <p className="text-sm text-ink-500 mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ───────── Card ───────── */

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-3xl bg-white border border-ink-100 p-5 md:p-6",
        className,
      )}>
      {children}
    </div>
  );
}

/* ───────── Modal ───────── */

export function Modal({
  open,
  onClose,
  title,
  children,
  width = "max-w-2xl",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={clsx(
          "relative bg-white rounded-3xl shadow-2xl w-full overflow-hidden flex flex-col max-h-[90vh]",
          width,
        )}>
        <header className="flex items-center justify-between p-5 border-b border-ink-100">
          <h2 className="font-display font-black text-lg tracking-tight">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-ink-500 hover:bg-ink-50">
            <X size={18} />
          </button>
        </header>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

/* ───────── Confirm delete ───────── */

export function DeleteButton({
  onConfirm,
  label = "حذف",
}: {
  onConfirm: () => void;
  label?: string;
}) {
  const [confirming, setConfirming] = useState(false);
  if (confirming)
    return (
      <span className="inline-flex items-center gap-1">
        <button
          onClick={() => {
            setConfirming(false);
            onConfirm();
          }}
          className="px-2 py-1 rounded-lg text-[11px] font-bold bg-red-600 text-white">
          مطمئنم
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-2 py-1 rounded-lg text-[11px] text-ink-500 hover:bg-ink-50">
          انصراف
        </button>
      </span>
    );
  return (
    <button
      onClick={() => setConfirming(true)}
      className="p-1.5 rounded-lg text-ink-400 hover:bg-red-50 hover:text-red-600"
      aria-label={label}>
      <Trash2 size={16} />
    </button>
  );
}

export function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-1.5 rounded-lg text-ink-500 hover:bg-brand-50 hover:text-brand-600"
      aria-label="ویرایش">
      <Edit2 size={16} />
    </button>
  );
}

export function AddButton({
  onClick,
  label = "افزودن",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button onClick={onClick} className="btn-primary !py-2 !px-4 text-sm">
      <Plus size={16} /> {label}
    </button>
  );
}

/* ───────── Tag chip selector ───────── */

export function TagPicker({
  allTags,
  selected,
  onToggle,
}: {
  allTags: { id: string; name: string }[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {allTags.length === 0 && (
        <span className="text-xs text-ink-400">
          هنوز برچسبی تعریف نشده است.
        </span>
      )}
      {allTags.map((t) => {
        const active = selected.includes(t.id);
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onToggle(t.id)}
            className={clsx(
              "px-3 py-1 rounded-full text-xs font-medium border transition",
              active
                ? "bg-brand-500 text-white border-brand-500 shadow"
                : "bg-white text-ink-700 border-ink-200 hover:border-brand-300 hover:text-brand-600",
            )}>
            {t.name}
          </button>
        );
      })}
    </div>
  );
}
