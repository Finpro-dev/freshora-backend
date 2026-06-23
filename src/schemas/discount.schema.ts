import { z } from "zod";
import { DiscountType, DiscountValueType } from "../../generated/prisma/client";

export const createDiscountSchema = z.object({
  body: z.object({
    productId: z.string().uuid("Invalid product ID format"),
    type: z.nativeEnum(DiscountType, {
      message: "Invalid discount type",
    }),
    valueType: z.nativeEnum(DiscountValueType, {
      message: "Invalid discount value type",
    }),
    discountAmount: z
      .number()
      .positive("Discount amount must be greater than 0"),
    minTransaction: z
      .number()
      .nonnegative("Minimum transaction cannot be negative")
      .optional()
      .nullable(),
    maxDiscount: z
      .number()
      .nonnegative("Maximum discount cannot be negative")
      .optional()
      .nullable(),
    validFrom: z
      .string()
      .datetime({ message: "Invalid validFrom date format (ISO 8601)" }),
    validUntil: z
      .string()
      .datetime({ message: "Invalid validUntil date format (ISO 8601)" }),
  }),
});

export const getDiscountSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10)),
    type: z.nativeEnum(DiscountType).optional(),
    status: z.enum(["ACTIVE", "EXPIRED", "UPCOMING"]).optional(),
  }),
});

export type CreateDiscountInput = z.infer<typeof createDiscountSchema>["body"];
export type GetDiscountInput = z.infer<typeof getDiscountSchema>["query"];
