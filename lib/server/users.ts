import "server-only";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/db";
import { normalizeIranPhone } from "./phone";

/** Generate a unique, human-friendly referral code. */
async function generateReferralCode(): Promise<string> {
  for (let i = 0; i < 6; i++) {
    const code = randomBytes(4).toString("hex").toUpperCase();
    const exists = await prisma.user.findUnique({
      where: { referralCode: code },
    });
    if (!exists) return code;
  }
  // Extremely unlikely fallback.
  return randomBytes(6).toString("hex").toUpperCase();
}

export async function findUserByPhone(rawPhone: string) {
  const phone = normalizeIranPhone(rawPhone);
  if (!phone) return null;
  return prisma.user.findUnique({ where: { phone } });
}

export type CreateUserInput = {
  phone: string;
  name?: string;
  phoneVerified?: boolean;
  referredByCode?: string;
};

/**
 * Create a customer. If `referredByCode` matches an existing user, the
 * referral relationship + Referral record are created atomically (Phase 11).
 */
export async function createUser(input: CreateUserInput) {
  const phone = normalizeIranPhone(input.phone);
  if (!phone) throw new Error("INVALID_PHONE");

  const referralCode = await generateReferralCode();

  let inviter = null;
  if (input.referredByCode) {
    inviter = await prisma.user.findUnique({
      where: { referralCode: input.referredByCode.toUpperCase() },
    });
  }

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        phone,
        name: input.name ?? null,
        phoneVerified: input.phoneVerified ?? false,
        referralCode,
        invitedById: inviter?.id ?? null,
      },
    });

    if (inviter) {
      await tx.referral.create({
        data: {
          inviterId: inviter.id,
          invitedUserId: user.id,
          referralCode: inviter.referralCode,
        },
      });
    }

    return user;
  });
}

export async function markPhoneVerified(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { phoneVerified: true },
  });
}
