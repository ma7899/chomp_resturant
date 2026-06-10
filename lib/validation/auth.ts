import { z } from "zod";

/** Shared validation schemas (Phase 17 — validate every boundary). */

export const phoneSchema = z
  .string()
  .min(8, "شماره موبایل نامعتبر است")
  .max(20);

export const passwordSchema = z
  .string()
  .min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد")
  .max(100);

export const otpCodeSchema = z
  .string()
  .regex(/^\d{6}$/, "کد تأیید باید ۶ رقم باشد");

export const requestOtpSchema = z.object({
  phone: phoneSchema,
  purpose: z.enum(["LOGIN", "REGISTER", "RESET"]).default("LOGIN"),
});

export const verifyOtpSchema = z.object({
  phone: phoneSchema,
  code: otpCodeSchema,
  purpose: z.enum(["LOGIN", "REGISTER", "RESET"]).default("LOGIN"),
});

export const registerSchema = z.object({
  phone: phoneSchema,
  code: otpCodeSchema,
  name: z.string().min(2, "نام را وارد کنید").max(80).optional(),
  password: passwordSchema.optional(),
  referredByCode: z.string().max(32).optional(),
});

export const passwordLoginSchema = z.object({
  phone: phoneSchema,
  password: passwordSchema,
});

export const resetPasswordSchema = z.object({
  phone: phoneSchema,
  code: otpCodeSchema,
  password: passwordSchema,
});

export const checkPhoneSchema = z.object({
  phone: phoneSchema,
});
