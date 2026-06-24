import { z } from "zod";

/** Shared validation schemas (Phase 17 — validate every boundary). */

export const phoneSchema = z
  .string()
  .transform((v) => v.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))))
  .transform((v) => v.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))))
  .transform((v) => v.replace(/\s+/g, ""))
  .refine(
    (v) => /^(?:\+98|0098|98|0)?9\d{9}$/.test(v),
    "شماره موبایل نامعتبر است",
  );

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
  referredByCode: z.string().max(32).optional(),
});

export const checkPhoneSchema = z.object({
  phone: phoneSchema,
});
