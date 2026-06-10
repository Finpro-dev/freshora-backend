import { z } from "zod";

const DiscountTypeEnum = z.enum([
  "BUY_ONE_GET_ONE",
  "MIN_TRANSACTION",
  "NO_REQUIREMENT",
]);

export const createDiscountSchema = z.object({
  body: z
    .object({
      productId: z.string().uuid("Invalid product ID format"),

      type: DiscountTypeEnum,

      discountAmount: z.coerce
        .number()
        .positive("Discount value must be greater than 0"),

      minTransaction: z.coerce
        .number()
        .positive("Minimum transaction must be greater than 0")
        .nullable()
        .optional(),

      validFrom: z.string().datetime(),

      validUntil: z.string().datetime(),
    })
    .superRefine((data, ctx) => {
      const validFrom = new Date(data.validFrom);
      const validUntil = new Date(data.validUntil);

      // Ambil batas bawah waktu hari ini (mulai dari jam 00:00:00)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (validFrom < today) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["validFrom"],
          message: "Valid from date cannot be in the past",
        });
      }

      if (validUntil <= validFrom) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["validUntil"],
          message: "Valid until must be after valid from",
        });
      }

      if (
        (data.type === "MIN_TRANSACTION" &&
          data.minTransaction === undefined) ||
        data.minTransaction === null
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["minTransaction"],
          message: "minTransaction is required for MIN_TRANSACTION discount",
        });
      }

      if (
        data.type !== "MIN_TRANSACTION" &&
        data.minTransaction !== undefined
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["minTransaction"],
          message:
            "minTransaction can only be used with MIN_TRANSACTION discount",
        });
      }
    }),
});

export const getDiscountSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(10),

    type: DiscountTypeEnum.optional(),

    status: z.enum(["ACTIVE", "EXPIRED"]).optional(),
  }),
});

export type CreateDiscountInput = z.infer<typeof createDiscountSchema>["body"];
export type GetDiscountInput = z.infer<typeof getDiscountSchema>["query"];
