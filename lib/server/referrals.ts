import "server-only";
import { prisma } from "@/lib/db";

/**
 * Referral program (Phase 11 / feature 8).
 * Each user has a referralCode; new signups can pass it to attribute the
 * invite. Here we expose stats for the customer dashboard and admin view.
 */

export async function getReferralOverview(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true, referralClicks: true },
  });

  // Everyone this user invited.
  const invitees = await prisma.user.findMany({
    where: { invitedById: userId },
    select: { id: true, name: true, phone: true, createdAt: true },
  });

  // Of those, how many have placed at least one order (converted).
  const invitedIds = invitees.map((i) => i.id);
  const convertedIds = invitedIds.length
    ? await prisma.order.findMany({
        where: { userId: { in: invitedIds } },
        select: { userId: true },
        distinct: ["userId"],
      })
    : [];

  const converted = new Set(convertedIds.map((o) => o.userId));
  const registered = invitees.length;
  const convertedCount = invitees.filter((i) => converted.has(i.id)).length;
  const clicks = user?.referralClicks ?? 0;
  const conversionRate = registered > 0 ? convertedCount / registered : 0;

  return {
    referralCode: user?.referralCode ?? "",
    clicks,
    registered,
    converted: convertedCount,
    conversionRate,
    invitees: invitees.map((i) => ({
      id: i.id,
      name: i.name,
      phone: maskPhone(i.phone),
      joinedAt: i.createdAt,
      converted: converted.has(i.id),
    })),
  };
}

/** Admin-facing: invite counts per user. */
export async function getReferralLeaderboard(limit = 50) {
  const rows = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    select: {
      id: true,
      name: true,
      phone: true,
      referralCode: true,
      _count: { select: { invitees: true } },
    },
    orderBy: { invitees: { _count: "desc" } },
    take: limit,
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    phone: maskPhone(r.phone),
    referralCode: r.referralCode,
    invitedCount: r._count.invitees,
  }));
}

function maskPhone(phone: string): string {
  if (phone.length < 7) return phone;
  return phone.slice(0, 4) + "***" + phone.slice(-3);
}
