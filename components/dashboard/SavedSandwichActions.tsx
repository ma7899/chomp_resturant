"use client";

import { useState, useTransition } from "react";
import { Globe, Loader2, Trash2 } from "lucide-react";
import {
  deleteSavedSandwichAction,
  publishSavedSandwichAction,
} from "@/app/dashboard/saved/actions";

export default function SavedSandwichActions({
  sandwichId,
  isPublic,
}: {
  sandwichId: string;
  isPublic: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onDelete() {
    if (!confirm("این ساندویچ حذف شود؟")) return;
    setError(null);
    startTransition(async () => {
      const r = await deleteSavedSandwichAction(sandwichId);
      if (!r.ok) setError(r.error);
    });
  }

  function onPublish() {
    setError(null);
    startTransition(async () => {
      const r = await publishSavedSandwichAction(sandwichId);
      if (!r.ok) setError(r.error);
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {!isPublic && (
          <button
            onClick={onPublish}
            disabled={pending}
            className="btn-outline !py-2 !px-3 text-xs">
            {pending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Globe size={14} />
            )}
            عمومی‌سازی
          </button>
        )}
        <button
          onClick={onDelete}
          disabled={pending}
          className="btn-ghost !py-2 !px-3 text-xs !text-red-600 hover:!bg-red-50">
          {pending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Trash2 size={14} />
          )}
          حذف
        </button>
      </div>
      {error && (
        <p className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}
