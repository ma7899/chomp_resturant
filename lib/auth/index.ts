import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { findUserByPhone } from "@/lib/server/users";
import { verifyOtp } from "@/lib/server/otp";

/**
 * Full Auth.js instance (Node runtime — has DB + bcrypt access).
 *
 * A single Credentials provider supports OTP-only auth:
 *   mode="otp" → phone + 6-digit code (already issued via /api/auth/otp)
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      id: "credentials",
      name: "Chomp",
      credentials: {
        phone: { label: "Phone", type: "text" },
        code: { label: "Code", type: "text" },
        mode: { label: "Mode", type: "text" },
      },
      async authorize(creds) {
        const phone = String(creds?.phone ?? "");
        const mode = String(creds?.mode ?? "otp");

        if (!phone) return null;
        if (mode !== "otp") return null;

        const code = String(creds?.code ?? "");
        const result = await verifyOtp(phone, "LOGIN", code);
        if (!result.ok) return null;
        const user = await findUserByPhone(phone);
        if (!user) return null;
        return {
          id: user.id,
          name: user.name ?? user.phone,
          phone: user.phone,
          role: user.role,
        };
      },
    }),
  ],
});
