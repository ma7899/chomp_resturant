import { z } from "zod";

/** Address form validation (Phase 9 / feature 9). */
export const addressSchema = z.object({
  title: z.string().min(1, "عنوان را وارد کنید").max(60),
  province: z.string().min(1, "استان را وارد کنید").max(60),
  city: z.string().min(1, "شهر را وارد کنید").max(60),
  street: z.string().min(1, "خیابان را وارد کنید").max(200),
  alley: z.string().max(120).optional().nullable(),
  buildingNumber: z.string().max(20).optional().nullable(),
  unit: z.string().max(20).optional().nullable(),
  postalCode: z
    .string()
    .regex(/^\d{10}$/, "کد پستی باید ۱۰ رقم باشد")
    .optional()
    .or(z.literal(""))
    .nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  isDefault: z.boolean().optional(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;

export const allergySchema = z.object({
  ingredientIds: z.array(z.string()).max(200),
});
