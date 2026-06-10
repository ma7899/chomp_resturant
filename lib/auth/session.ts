import "server-only";
import { redirect } from "next/navigation";
import { auth } from "./index";

/**
 * Server-side session helpers for RSC pages and route handlers.
 * Enforces the "users only access their own data" rule (Phase 17).
 */

export async function getSession() {
  return auth();
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/** Require a logged-in user or redirect to /login?next=… */
export async function requireUser(next?: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`);
  }
  return user;
}

/** Require an ADMIN user or redirect home. */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (user.role !== "ADMIN") redirect("/");
  return user;
}
