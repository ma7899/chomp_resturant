import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import DashboardNav from "@/components/dashboard/DashboardNav";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Gate the whole dashboard. Middleware already redirects, this is defense
  // in depth and gives us the user for the greeting.
  const user = await requireUser("/dashboard");

  return (
    <div className="bg-ink-50/40 min-h-[calc(100vh-4rem)]">
      <div className="container-x py-6 lg:grid lg:grid-cols-[260px_1fr] gap-6">
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-3xl bg-white border border-ink-100 p-5">
              <div className="text-xs text-ink-400">حساب کاربری</div>
              <div className="font-display font-extrabold text-lg mt-1 tracking-tight">
                {user.name || "کاربر چامپ"}
              </div>
              <div className="text-sm text-ink-500 tabular mt-0.5" dir="ltr">
                {user.phone}
              </div>
            </div>
            <DashboardNav />
          </div>
        </aside>

        <main className="min-w-0">
          {/* Mobile nav */}
          <div className="lg:hidden mb-4">
            <DashboardNav mobile />
          </div>
          {children}
        </main>
      </div>

      <div className="container-x pb-10">
        <Link href="/" className="text-xs text-ink-400 hover:text-brand-600">
          ← بازگشت به سایت
        </Link>
      </div>
    </div>
  );
}
