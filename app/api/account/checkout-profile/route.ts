import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ ok: true, authed: false });
  }

  const [user, addresses, allergies] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, phone: true },
    }),
    prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        province: true,
        city: true,
        street: true,
        alley: true,
        buildingNumber: true,
        unit: true,
        postalCode: true,
        isDefault: true,
      },
    }),
    prisma.userAllergy.findMany({
      where: { userId },
      select: { ingredientId: true, ingredient: { select: { name: true } } },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    authed: true,
    user: {
      name: user?.name ?? "",
      phone: user?.phone ?? "",
    },
    addresses: addresses.map((a) => ({
      ...a,
      text: `${a.province}، ${a.city}، ${a.street}${
        a.alley ? `، کوچه ${a.alley}` : ""
      }${a.buildingNumber ? `، پلاک ${a.buildingNumber}` : ""}${
        a.unit ? `، واحد ${a.unit}` : ""
      }`,
    })),
    allergyNames: allergies.map((a) => a.ingredient.name),
  });
}
