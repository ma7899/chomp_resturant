"use client";

import { SessionProvider, useSession, signOut } from "next-auth/react";

/**
 * Client-side auth helpers built on Auth.js (NextAuth) session.
 * Replaces the old localStorage admin store.
 */

export { SessionProvider, signOut };

export function useCurrentUser() {
  const { data, status } = useSession();
  return {
    user: data?.user ?? null,
    isLoading: status === "loading",
    isAuthed: status === "authenticated",
  };
}

export function useIsAdmin() {
  const { data, status } = useSession();
  return {
    isAdmin: data?.user?.role === "ADMIN",
    isLoading: status === "loading",
  };
}
