/**
 * Database seeder.
 *
 * Re-uses the existing in-app seed data (lib/seed.ts) as the single source of
 * truth, so the catalog stays identical to the prototype while it migrates to
 * Postgres. Run with:  npm run db:seed
 */
import { PrismaClient, DiscountType, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SEED_SANDWICHES, SEED_TAGS, SEED_TOPPINGS } from "../lib/seed";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

function makeReferralCode(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}

// Map old topping category keys → Category.kind / slug.
const CATEGORY_DEFS: { kind: string; name: string; slug: string }[] = [
  { kind: "bread", name: "نان", slug: "bread" },
  { kind: "protein", name: "پروتئین", slug: "protein" },
  { kind: "veggie", name: "سبزیجات", slug: "veggie" },
  { kind: "cheese", name: "پنیر", slug: "cheese" },
  { kind: "sauce", name: "سس", slug: "sauce" },
  { kind: "extra", name: "افزودنی‌ها", slug: "extra" },
];

async function main() {
  console.log("🌱 Seeding database…");

  // ── Tags ──
  for (const t of SEED_TAGS) {
    await prisma.tag.upsert({
      where: { id: t.id },
      update: { name: t.name, color: t.color },
      create: { id: t.id, name: t.name, color: t.color ?? null },
    });
  }
  console.log(`  ✓ ${SEED_TAGS.length} tags`);

  // ── Categories ──
  const categoryByKind = new Map<string, string>();
  for (let i = 0; i < CATEGORY_DEFS.length; i++) {
    const c = CATEGORY_DEFS[i];
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, kind: c.kind, sortOrder: i },
      create: { name: c.name, slug: c.slug, kind: c.kind, sortOrder: i },
    });
    categoryByKind.set(c.kind, row.id);
  }
  console.log(`  ✓ ${CATEGORY_DEFS.length} categories`);

  // ── Ingredients (from old toppings) ──
  for (const t of SEED_TOPPINGS) {
    const categoryId = categoryByKind.get(t.category) ?? null;
    await prisma.ingredient.upsert({
      where: { id: t.id },
      update: {
        name: t.name,
        price: t.price,
        description: t.description ?? null,
        legacyCategory: t.category,
        categoryId,
        tags: { set: t.tagIds.map((id) => ({ id })) },
      },
      create: {
        id: t.id,
        name: t.name,
        price: t.price,
        description: t.description ?? null,
        legacyCategory: t.category,
        categoryId,
        tags: { connect: t.tagIds.map((id) => ({ id })) },
      },
    });
  }
  console.log(`  ✓ ${SEED_TOPPINGS.length} ingredients`);

  // ── Sandwiches ──
  for (const s of SEED_SANDWICHES) {
    await prisma.sandwich.upsert({
      where: { slug: s.slug },
      update: {
        name: s.name,
        tagline: s.tagline,
        description: s.description,
        basePrice: s.basePrice,
        includedIngredients: s.includedIngredients,
        image: s.image,
        badge: s.badge ?? null,
        hero: s.hero ?? false,
        tags: { set: s.tagIds.map((id) => ({ id })) },
      },
      create: {
        slug: s.slug,
        name: s.name,
        tagline: s.tagline,
        description: s.description,
        basePrice: s.basePrice,
        includedIngredients: s.includedIngredients,
        image: s.image,
        badge: s.badge ?? null,
        hero: s.hero ?? false,
        tags: { connect: s.tagIds.map((id) => ({ id })) },
      },
    });
  }
  console.log(`  ✓ ${SEED_SANDWICHES.length} sandwiches`);

  // ── Admin user ──
  const adminPhone = process.env.ADMIN_PHONE ?? "09120000000";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";
  await prisma.user.upsert({
    where: { phone: adminPhone },
    update: { role: Role.ADMIN },
    create: {
      phone: adminPhone,
      name: "مدیر چامپ",
      role: Role.ADMIN,
      phoneVerified: true,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      referralCode: makeReferralCode(),
    },
  });
  console.log(`  ✓ admin user (${adminPhone})`);

  // ── A sample welcome discount ──
  await prisma.discount.upsert({
    where: { code: "WELCOME" },
    update: {},
    create: {
      code: "WELCOME",
      type: DiscountType.PERCENTAGE,
      percentage: 15,
      minPurchase: 300,
      maxDiscount: 100,
      usagePerUser: 1,
      isActive: true,
    },
  });
  console.log("  ✓ sample discount (WELCOME)");

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
