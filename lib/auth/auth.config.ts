import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js configuration.
 *
 * This file is imported by the middleware (which runs on the Edge runtime),
 * so it MUST NOT import Prisma, bcrypt, or any Node-only module. The actual
 * Credentials provider with DB access lives in `lib/auth/index.ts`.
 */

// Routes that are reachable without authentication.
// Everything else is gated by the middleware (Phase 3).
export const PUBLIC_ROUTES = [
  "/menu",
  "/toppings",
  "/login",
  "/about",
  "/contact",
];

// Prefixes that are always public (assets, auth endpoints, etc.).
export const PUBLIC_PREFIXES = [
  "/api/auth",
  "/_next",
  "/images",
  "/fonts",
  "/favicon",
];

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [], // real providers attached in lib/auth/index.ts
  callbacks: {
    // Expose role + id on the token/session.
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.role = (user as { role?: string }).role ?? "CUSTOMER";
        token.phone = (user as { phone?: string }).phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { phone?: string }).phone = token.phone as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
