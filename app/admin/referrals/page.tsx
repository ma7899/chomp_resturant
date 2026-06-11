import { requireAdmin } from "@/lib/auth/session";
import { getReferralLeaderboard } from "@/lib/server/referrals";
import { PageHeader, Card } from "@/components/admin/AdminUI";
import { Share2, Trophy } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminReferralsPage() {
  await requireAdmin();
  const leaderboard = await getReferralLeaderboard(50);
  const totalInvited = leaderboard.reduce((s, r) => s + r.invitedCount, 0);

  return (
    <div>
      <PageHeader
        title="دعوت‌ها (Referral)"
        subtitle="ببینید هر مشتری چند نفر را با کد معرفی خود دعوت کرده است."
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <Card>
          <div className="text-xs text-ink-400">کل دعوت‌های ثبت‌شده</div>
          <div className="font-display font-extrabold text-2xl mt-1 tabular">
            {totalInvited.toLocaleString("fa-IR")}
          </div>
        </Card>
        <Card>
          <div className="text-xs text-ink-400">معرف‌های فعال</div>
          <div className="font-display font-extrabold text-2xl mt-1 tabular">
            {leaderboard
              .filter((r) => r.invitedCount > 0)
              .length.toLocaleString("fa-IR")}
          </div>
        </Card>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="p-5 border-b border-ink-100 flex items-center gap-2 font-bold">
          <Trophy size={18} className="text-brand-500" /> برترین دعوت‌کننده‌ها
        </div>
        <table className="w-full text-sm">
          <thead className="bg-ink-50/60 text-ink-500">
            <tr>
              <th className="text-right font-medium px-4 py-3">#</th>
              <th className="text-right font-medium px-4 py-3">مشتری</th>
              <th className="text-right font-medium px-4 py-3">شماره</th>
              <th className="text-right font-medium px-4 py-3">کد دعوت</th>
              <th className="text-right font-medium px-4 py-3">تعداد دعوت</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-ink-400 py-10">
                  <Share2 size={32} className="mx-auto mb-2 opacity-40" />
                  هنوز دعوتی ثبت نشده است.
                </td>
              </tr>
            )}
            {leaderboard.map((r, i) => (
              <tr key={r.id} className="border-t border-ink-100">
                <td className="px-4 py-3 tabular text-ink-400">
                  {(i + 1).toLocaleString("fa-IR")}
                </td>
                <td className="px-4 py-3 font-semibold">{r.name || "—"}</td>
                <td className="px-4 py-3 tabular" dir="ltr">
                  {r.phone}
                </td>
                <td className="px-4 py-3 tabular">{r.referralCode}</td>
                <td className="px-4 py-3 tabular font-bold text-brand-600">
                  {r.invitedCount.toLocaleString("fa-IR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
