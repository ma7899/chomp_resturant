import "server-only";
import { prisma } from "@/lib/db";

/** Address repository — every function is scoped to the owning user (Phase 17). */

export async function listAddresses(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

export type AddressInput = {
  title: string;
  province: string;
  city: string;
  street: string;
  alley?: string | null;
  buildingNumber?: string | null;
  unit?: string | null;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isDefault?: boolean;
};

export async function createAddress(userId: string, data: AddressInput) {
  return prisma.$transaction(async (tx) => {
    // If this is the user's first address, force it default.
    const count = await tx.address.count({ where: { userId } });
    const makeDefault = data.isDefault || count === 0;
    if (makeDefault) {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return tx.address.create({
      data: { ...data, isDefault: makeDefault, userId },
    });
  });
}

export async function updateAddress(
  userId: string,
  id: string,
  data: AddressInput,
) {
  // Ownership check.
  const existing = await prisma.address.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("NOT_FOUND");

  return prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return tx.address.update({ where: { id }, data });
  });
}

export async function deleteAddress(userId: string, id: string) {
  const existing = await prisma.address.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("NOT_FOUND");
  await prisma.address.delete({ where: { id } });

  // Promote another address to default if we removed the default one.
  if (existing.isDefault) {
    const next = await prisma.address.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    if (next) {
      await prisma.address.update({
        where: { id: next.id },
        data: { isDefault: true },
      });
    }
  }
}

export async function setDefaultAddress(userId: string, id: string) {
  const existing = await prisma.address.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("NOT_FOUND");
  await prisma.$transaction([
    prisma.address.updateMany({ where: { userId }, data: { isDefault: false } }),
    prisma.address.update({ where: { id }, data: { isDefault: true } }),
  ]);
}
