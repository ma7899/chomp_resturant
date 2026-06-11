import { PrismaClient } from "@prisma/client";

/**
 * Singleton Prisma client.
 *
 * In development Next.js hot-reload re-evaluates modules frequently, which
 * would otherwise open a new DB connection on every reload and exhaust the
 * pool. We cache the instance on `globalThis`.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
