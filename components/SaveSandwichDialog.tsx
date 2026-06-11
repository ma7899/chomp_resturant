"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Check, Loader2, X, Globe, Lock } from "lucide-react";
import { saveCustomSandwichAction } from "@/app/community/actions";

/**
 * "Save my sandwich" dialog (features 2, 7, 10).
 * Lets a customer name their built recipe, optionally publish it to the
 * community marketplace, and save it. Duplicate public recipes are de-duped
 * server-side via recipeHash.
 */
export default function SaveSandwichDialog({
  baseSlug,
  basePrice,
  ingredientIds,
  defaultName,
}: {
  baseSlug: string | null;
  basePrice: number;
  ingredientIds: string[];
  defaultName?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaultName ?? "");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [done, setDone] = useState<null | "saved" | "deduped">(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    startTransition(async () => {
      const r = await saveCustomSandwichAction({
        name,
        description: description || null,
        baseSlug,
        basePrice,
        isPublic,
        ingredientIds,
      });
      if (r.ok) {
        setDone(r.deduped ? "deduped" : "saved");
        router.refresh();
      } else {
        setError(r.error);
      }
    });
  }

  return (
    <>
      <button
        onClick={() => {
          setDone(null);
          setOpen(true);
        }}
        className="btn-ghost">
        <Bookmark size={18} /> ذخیره ساندویچ من
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-extrabold text-xl tracking-tight">
                ذخیره ساندویچ
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-ink-400 hover:text-ink-700"
                aria-label="بستن">
                <X size={22} />
              </button>
            </div>

            {done ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-green-100 text-green-600 mx-auto flex items-center justify-center">
                  <Check size={28} />
                </div>
                <p className="font-bold mt-4">
                  {done === "deduped"
                    ? "این ترکیب از قبل وجود داشت و به همان متصل شد."
                    : "ساندویچ شما ذخیره شد!"}
                </p>
                <div className="flex gap-2 justify-center mt-5">
                  {isPublic && (
                    <button
                      onClick={() => router.push("/community")}
                      className="btn-ghost !py-2 !px-4 text-sm">
                      دیدن در مارکت
                    </button>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    className="btn-primary !py-2 !px-4 text-sm">
                    باشه
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-ink-700">
                    نام ساندویچ <span className="text-brand-600">*</span>
                  </span>
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثلاً مانستر چیز"
                    className="mt-1.5 w-full rounded-2xl border border-ink-100 px-4 py-3 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-ink-700">
                    توضیح کوتاه (اختیاری)
                  </span>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    placeholder="چه چیزی این ساندویچ رو خاص می‌کنه؟"
                    className="mt-1.5 w-full rounded-2xl border border-ink-100 px-4 py-3 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition"
                  />
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPublic(true)}
                    className={`rounded-2xl border-2 p-3 text-sm transition ${
                      isPublic
                        ? "border-brand-500 bg-brand-50"
                        : "border-ink-100"
                    }`}>
                    <Globe size={18} className="mx-auto mb-1 text-brand-600" />
                    عمومی (دیگران ببینند)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPublic(false)}
                    className={`rounded-2xl border-2 p-3 text-sm transition ${
                      !isPublic
                        ? "border-brand-500 bg-brand-50"
                        : "border-ink-100"
                    }`}>
                    <Lock size={18} className="mx-auto mb-1 text-ink-500" />
                    خصوصی (فقط من)
                  </button>
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5">
                    {error}
                  </div>
                )}

                <button
                  onClick={save}
                  disabled={pending || name.trim().length < 2}
                  className="btn-primary w-full">
                  {pending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <Bookmark size={18} /> ذخیره
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
