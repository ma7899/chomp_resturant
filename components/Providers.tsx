"use client";

import { SessionProvider } from "next-auth/react";
import AuthModal from "./AuthModal";

/**
 * Wraps the app so client components can read the Auth.js session.
 * Mounted once in the root layout. Also hosts the global auth modal.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <AuthModal />
    </SessionProvider>
  );
}
