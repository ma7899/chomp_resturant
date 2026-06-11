import { z } from "zod";

export const discountSchema = z
  .object({
    code: z.string().min(2, "کد را وارد کنید").max(32),
    type: z.enum(["PERCENTAGE", "FIXED"]),
    percentage: z.number().int().min(1).max(100).optional().nullable(),
    fixedAmount: z.number().int().min(1).optional().nullable(),
    minPurchase: z.number().int().min(0).optional().nullable(),
    maxDiscount: z.number().int().min(0).optional().nullable(),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
    usageLimit: z.number().int().min(1).optional().nullable(),
    usagePerUser: z.number().int().min(1).optional().nullable(),
    isActive: z.boolean(),
  })
  .refine((d) => (d.type === "PERCENTAGE" ? !!d.percentage : !!d.fixedAmount), {
    message: "مقدار تخفیف را وارد کنید",
  });

export const categorySchema = z.object({
  name: z.string().min(1, "نام را وارد کنید").max(60),
  slug: z
    .string()
    .min(1, "نامک را وارد کنید")
    .max(60)
    .regex(/^[a-z0-9-]+$/, "نامک فقط حروف کوچک، عدد و خط تیره"),
  kind: z.string().min(1).max(40),
  sortOrder: z.number().int().min(0).max(999),
});

export const comboSchema = z.object({
  name: z.string().min(1, "نام را وارد کنید").max(80),
  description: z.string().max(300).optional().nullable(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().int().min(0),
  image: z.string().max(500).optional().nullable(),
  isActive: z.boolean(),
  items: z
    .array(
      z.object({
        sandwichId: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1, "حداقل یک ساندویچ به کمبو اضافه کنید"),
});
