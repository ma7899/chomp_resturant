import NextAuth from "next-auth";
import type { DefaultSession } from "next-auth";

// Augment the session/user types with our custom fields.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      phone: string;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role?: string;
    phone?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    phone?: string;
  }
}
