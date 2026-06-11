import Link from "next/link";
import { ChefHat } from "lucide-react";
import { requireUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function SavedSandwichesPage() {
  await requireUser("/dashboard/saved");

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display font-black text-2xl tracking-tight">
          ساندویچ‌های من
        </h1>
        <p className="text-ink-500 mt-1 text-sm leading-7">
          ساندویچ‌هایی که ساخته‌ای و ذخیره کرده‌ای اینجا ظاهر می‌شوند. می‌توانی
          آن‌ها را عمومی کنی تا دیگران هم سفارش دهند.
        </p>
      </header>

      <div className="rounded-3xl bg-white border border-dashed border-ink-200 p-10 text-center text-ink-400">
        <ChefHat size={40} className="mx-auto mb-3 opacity-40" />
        هنوز ساندویچی ذخیره نکرده‌ای.
        <div className="mt-4">
          <Link href="/build" className="btn-primary inline-flex">
            ساخت ساندویچ
          </Link>
        </div>
      </div>
    </div>
  );
}
