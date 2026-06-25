import { z } from "zod";

export const saveCustomSchema = z.object({
  name: z.string().min(2, "نام ساندویچ را وارد کنید").max(60),
  description: z.string().max(300).optional().nullable(),
  baseSlug: z.string().max(80).optional().nullable(),
  basePrice: z.number().int().min(0).max(100000),
  isPublic: z.boolean(),
  ingredientIds: z.array(z.string()).max(60),
});

export const rateSchema = z
  .object({
    customSandwichId: z.string().min(1).optional().nullable(),
    menuSandwichSlug: z.string().min(1).optional().nullable(),
    sandwichId: z.string().min(1).optional().nullable(), // for backwards compatibility
    orderId: z.string().min(1),
    rating: z.number().int().min(1).max(5),
    review: z.string().max(500).optional().nullable(),
  })
  .refine(
    (data) => data.customSandwichId || data.menuSandwichSlug || data.sandwichId,
    { message: "customSandwichId یا menuSandwichSlug باید وجود داشته باشد" },
  );
