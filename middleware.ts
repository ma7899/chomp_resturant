import NextAuth from "next-auth";
import { authConfig, PUBLIC_ROUTES, PUBLIC_PREFIXES } from "@/lib/auth/auth.config";

/**
 * Edge middleware — gates every route except the public ones (Phase 3 + 17).
 *
 * Uses the edge-safe `authConfig` (no Prisma/bcrypt here). Authorization for
 * data access still happens per-request in the API/services; this only guards
 * page navigation and unauthenticated API calls.
 */
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const path = nextUrl.pathname;

  const isPublicPrefix = PUBLIC_PREFIXES.some((p) => path.startsWith(p));
  const isPublicRoute =
    path === "/" ||
    PUBLIC_ROUTES.some((r) => path === r || path.startsWith(r + "/"));

  if (isPublicPrefix || isPublicRoute) return;

  // Admin area requires the ADMIN role.
  if (path.startsWith("/admin")) {
    if (!isLoggedIn) {
      return Response.redirect(new URL(`/login?next=${encodeURIComponent(path)}`, nextUrl));
    }
    const role = (req.auth?.user as { role?: string } | undefined)?.role;
    if (role !== "ADMIN") {
      return Response.redirect(new URL("/", nextUrl));
    }
    return;
  }

  // Everything else: must be logged in.
  if (!isLoggedIn) {
    return Response.redirect(
      new URL(`/login?next=${encodeURIComponent(path)}`, nextUrl),
    );
  }
});

export const config = {
  // Run on all routes except static assets & image optimizer.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
