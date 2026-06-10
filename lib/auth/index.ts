import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { verifyPassword, findUserByPhone } from "@/lib/server/users";
import { verifyOtp } from "@/lib/server/otp";

/**
 * Full Auth.js instance (Node runtime — has DB + bcrypt access).
 *
 * A single Credentials provider supports BOTH flows the product needs:
 *   mode="password"  → phone + password
 *   mode="otp"       → phone + 6-digit code (already issued via /api/auth/otp)
 *
 * This matches the requested UX: the modal asks for a phone, then a password,
 * with a "send code instead" option that switches to the OTP path.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      id: "credentials",
      name: "Chomp",
      credentials: {
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" },
        code: { label: "Code", type: "text" },
        mode: { label: "Mode", type: "text" },
      },
      async authorize(creds) {
        const phone = String(creds?.phone ?? "");
        const mode = String(creds?.mode ?? "password");

        if (!phone) return null;

        if (mode === "otp") {
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
        }

        // Default: password login.
        const password = String(creds?.password ?? "");
        if (!password) return null;
        const user = await verifyPassword(phone, password);
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
