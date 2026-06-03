"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  RefreshCw,
  Sparkles,
  Wand2,
} from "lucide-react";
import { recommendSandwich, useData } from "@/lib/store";
import { formatPrice } from "@/lib/menu";
import type { Sandwich } from "@/lib/types";

export default function TastePage() {
  const form = useData((s) => s.tasteForm);
  const sandwiches = useData((s) => s.sandwiches);
  const tags = useData((s) => s.tags);

  const [step, setStep] = useState(0);
  // answers[qIndex] = selected option ids
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [done, setDone] = useState(false);

  const q = form.questions[step];

  const scores = useMemo<Record<string, number>>(() => {
    const s: Record<string, number> = {};
    for (const question of form.questions) {
      const selected = answers[question.id] ?? [];
      for (const optId of selected) {
        const opt = question.options.find((o) => o.id === optId);
        if (!opt) continue;
        for (const b of opt.tagBoosts) {
          s[b.tagId] = (s[b.tagId] ?? 0) + b.weight;
        }
      }
    }
    return s;
  }, [answers, form.questions]);

  const result = useMemo(
    () => recommendSandwich(scores, sandwiches),
    [scores, sandwiches],
  );

  const toggle = (qid: string, oid: string, multi: boolean) => {
    setAnswers((prev) => {
      const cur = prev[qid] ?? [];
      if (multi) {
        return {
          ...prev,
          [qid]: cur.includes(oid)
            ? cur.filter((x) => x !== oid)
            : [...cur, oid],
        };
      }
      return { ...prev, [qid]: [oid] };
    });
  };

  const next = () => {
    if (step < form.questions.length - 1) setStep(step + 1);
    else setDone(true);
  };

  const restart = () => {
    setAnswers({});
    setStep(0);
    setDone(false);
  };

  if (form.questions.length === 0) {
    return (
      <div className="container-x py-20 text-center">
        <h1 className="heading text-2xl font-black">
          فرم ذائقه‌سنج هنوز آماده نشده
        </h1>
        <p className="text-ink-500 mt-3">به‌زودی برمی‌گردیم!</p>
        <Link href="/menu" className="btn-primary mt-6 inline-flex">
          مشاهده منو
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <ResultView
        result={result}
        scores={scores}
        tags={tags}
        onRestart={restart}
      />
    );
  }

  const selected = answers[q.id] ?? [];
  const canProceed = selected.length > 0;
  const progress = ((step + 1) / form.questions.length) * 100;

  return (
    <div className="container-x py-10 md:py-16 max-w-2xl">
      <header className="text-center mb-8">
        <span className="chip mb-3">
          <Wand2 size={12} /> {form.title}
        </span>
        <h1 className="heading text-3xl md:text-4xl font-black">
          {form.intro}
        </h1>
      </header>

      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-ink-500 mb-2">
          <span>
            سؤال {step + 1} از {form.questions.length}
          </span>
          <span className="tabular">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-l from-brand-500 to-brand-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="rounded-3xl bg-white border border-ink-100 p-6 md:p-8 shadow-card">
        <h2 className="font-display font-black text-xl">{q.text}</h2>
        {q.help && (
          <p className="text-sm text-ink-500 mt-1">{q.help}</p>
        )}
        <p className="text-[11px] text-ink-400 mt-2">
          {q.type === "multi"
            ? "می‌تونی چند گزینه انتخاب کنی"
            : "یکی از گزینه‌ها رو انتخاب کن"}
        </p>

        <div className="mt-5 grid sm:grid-cols-2 gap-3">
          {q.options.map((o) => {
            const active = selected.includes(o.id);
            return (
              <button
                key={o.id}
                onClick={() => toggle(q.id, o.id, q.type === "multi")}
                className={clsx(
                  "text-right rounded-2xl border-2 px-4 py-3 transition flex items-center justify-between",
                  active
                    ? "border-brand-500 bg-brand-50 shadow-glow"
                    : "border-ink-100 bg-white hover:border-brand-300",
                )}>
                <span className="font-medium">{o.label}</span>
                <span
                  className={clsx(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs transition",
                    active
                      ? "bg-brand-500 text-white"
                      : "bg-ink-100 text-ink-400",
                  )}>
                  {active && <Check size={14} />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="btn-ghost !py-2 !px-4 text-sm">
          <ArrowRight size={16} /> قبل
        </button>
        <button
          onClick={next}
          disabled={!canProceed}
          className="btn-primary !py-2 !px-4 text-sm">
          {step === form.questions.length - 1 ? "دیدن پیشنهاد" : "بعدی"}
          <ArrowLeft size={16} />
        </button>
      </div>
    </div>
  );
}

function ResultView({
  result,
  scores,
  tags,
  onRestart,
}: {
  result: { sandwich: Sandwich | null; ranked: { sandwich: Sandwich; score: number }[] };
  scores: Record<string, number>;
  tags: { id: string; name: string }[];
  onRestart: () => void;
}) {
  const s = result.sandwich;
  const topTagIds = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  if (!s) {
    return (
      <div className="container-x py-20 text-center">
        <h1 className="heading text-2xl font-black">پیشنهادی پیدا نشد</h1>
        <p className="text-ink-500 mt-3">
          هنوز ساندویچی در منو نیست یا برچسب‌ها همخوانی ندارند.
        </p>
        <button onClick={onRestart} className="btn-primary mt-6 inline-flex">
          <RefreshCw size={16} /> دوباره
        </button>
      </div>
    );
  }

  return (
    <div className="container-x py-10 md:py-16 max-w-3xl">
      <div className="text-center mb-8">
        <span className="chip mb-3">
          <Sparkles size={12} /> پیشنهاد ویژه‌ی ذائقه‌سنج
        </span>
        <h1 className="heading text-3xl md:text-4xl font-black">
          فکر می‌کنیم عاشق این می‌شی!
        </h1>
      </div>

      <article className="rounded-[2rem] bg-white border border-ink-100 shadow-card overflow-hidden">
        <div className="relative aspect-[21/9]">
          <Image
            src={s.image}
            alt={s.name}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="p-6 md:p-8 space-y-4">
          <div>
            <h2 className="heading text-3xl font-black">{s.name}</h2>
            <p className="text-brand-600 font-medium mt-1">{s.tagline}</p>
          </div>
          <p className="text-ink-600 leading-8 text-[15px]">{s.description}</p>

          {topTagIds.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-ink-500 mb-2">
                بر اساس ذائقه‌ی شما
              </h3>
              <div className="flex flex-wrap gap-2">
                {topTagIds.map((id) => {
                  const t = tags.find((x) => x.id === id);
                  if (!t) return null;
                  return (
                    <span
                      key={id}
                      className="px-3 py-1 text-xs font-medium rounded-full bg-brand-50 text-brand-700 border border-brand-100">
                      {t.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-ink-100">
            <span className="price text-2xl text-ink-900">
              {formatPrice(s.basePrice)}{" "}
              <span className="text-xs font-medium text-ink-500">تومان</span>
            </span>
            <div className="flex gap-2">
              <Link
                href={`/menu/${s.slug}`}
                className="btn-ghost !py-2 !px-4 text-sm">
                جزئیات بیشتر
              </Link>
              <Link
                href={`/build?sandwich=${s.slug}`}
                className="btn-primary !py-2 !px-4 text-sm">
                سفارش این ساندویچ <ArrowLeft size={16} />
              </Link>
            </div>
          </div>
        </div>
      </article>

      {result.ranked.length > 1 && (
        <div className="mt-8">
          <h3 className="font-bold mb-3">گزینه‌های جایگزین</h3>
          <ul className="grid sm:grid-cols-2 gap-3">
            {result.ranked.slice(1, 4).map(({ sandwich: alt, score }) => (
              <li key={alt.id}>
                <Link
                  href={`/menu/${alt.slug}`}
                  className="flex items-center gap-3 rounded-2xl bg-white border border-ink-100 p-3 hover:border-brand-300 transition">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-brand-50 shrink-0">
                    <Image src={alt.image} alt={alt.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate">{alt.name}</div>
                    <div className="text-xs text-ink-500">
                      امتیاز همخوانی: {score}
                    </div>
                  </div>
                  <span className="price text-brand-600 text-sm">
                    {formatPrice(alt.basePrice)} ت
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-center mt-8">
        <button onClick={onRestart} className="btn-ghost !py-2 !px-4 text-sm">
          <RefreshCw size={16} /> پاسخ‌ها رو از اول بده
        </button>
      </div>
    </div>
  );
}
