"use client";

import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";

export default function ReferralShare({ code }: { code: string }) {
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  const link =
    typeof window !== "undefined"
      ? `${window.location.origin}/?ref=${code}`
      : `/?ref=${code}`;

  async function copy(value: string, which: "code" | "link") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(which);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "چامپ ساندویچ",
          text: `با کد دعوت من در چامپ ثبت‌نام کن: ${code}`,
          url: link,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      copy(link, "link");
    }
  }

  return (
    <div className="rounded-3xl bg-gradient-to-bl from-brand-500 to-brand-600 text-white p-6">
      <div className="text-sm text-white/80">کد دعوت اختصاصی شما</div>
      <div className="flex items-center gap-3 mt-2 flex-wrap">
        <span className="font-display font-black text-3xl tracking-[0.2em] tabular">
          {code}
        </span>
        <button
          onClick={() => copy(code, "code")}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/20 hover:bg-white/30 px-3 py-1.5 text-sm font-semibold transition">
          {copied === "code" ? <Check size={15} /> : <Copy size={15} />}
          {copied === "code" ? "کپی شد" : "کپی کد"}
        </button>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <div
          className="flex-1 rounded-xl bg-white/15 px-4 py-2.5 text-sm tabular truncate"
          dir="ltr">
          {link}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => copy(link, "link")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white text-brand-600 px-4 py-2.5 text-sm font-bold hover:bg-brand-50 transition">
            {copied === "link" ? <Check size={16} /> : <Copy size={16} />}
            کپی لینک
          </button>
          <button
            onClick={share}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 px-4 py-2.5 text-sm font-bold transition">
            <Share2 size={16} /> اشتراک
          </button>
        </div>
      </div>
    </div>
  );
}
