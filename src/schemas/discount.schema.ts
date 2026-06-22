import { z } from "zod";

const DiscountTypeEnum = z.enum([
  "BUY_ONE_GET_ONE",
  "MIN_TRANSACTION",
  "NO_REQUIREMENT",
]);

const DiscountValueTypeEnum = z.enum(["PERCENTAGE", "NOMINAL"]); // 🆕

export const createDiscountSchema = z.object({
  body: z
    .object({
      productId: z.string().uuid("Invalid product ID format"),
      type: DiscountTypeEnum,
      valueType: DiscountValueTypeEnum, // 🆕
      discountAmount: z.coerce
        .number()
        .nonnegative("Discount value cannot be negative"), // Diubah ke nonnegative agar BOGO bisa bernilai 0
      minTransaction: z.coerce
        .number()
        .positive("Minimum transaction must be greater than 0")
        .nullable()
        .optional(),
      maxDiscount: z.coerce
        .number()
        .positive("Max discount limit must be greater than 0")
        .nullable()
        .optional(), // 🆕
      validFrom: z.string().datetime(),
      validUntil: z.string().datetime(),
    })
    .superRefine((data, ctx) => {
      const validFrom = new Date(data.validFrom);
      const validUntil = new Date(data.validUntil);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 1. Validasi Tanggal
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

      // 2. Validasi Nilai Persentase (Maksimal 100%)
      if (data.valueType === "PERCENTAGE" && data.discountAmount > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["discountAmount"],
          message: "Percentage discount cannot exceed 100%",
        });
      }

      // 3. Validasi Kondisional MIN_TRANSACTION
      const hasMinTransaction =
        data.minTransaction !== undefined && data.minTransaction !== null;
      if (data.type === "MIN_TRANSACTION" && !hasMinTransaction) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["minTransaction"],
          message: "minTransaction is required for MIN_TRANSACTION discount",
        });
      }
      if (data.type !== "MIN_TRANSACTION" && hasMinTransaction) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["minTransaction"],
          message:
            "minTransaction can only be used with MIN_TRANSACTION discount",
        });
      }

      // 4. Validasi Kondisional Limitasi Diskon (maxDiscount)
      // Limitasi maxDiscount hanya masuk akal jika tipenya PERCENTAGE pada MIN_TRANSACTION
      if (data.valueType === "NOMINAL" && data.maxDiscount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["maxDiscount"],
          message:
            "Limitation (maxDiscount) is only applicable for PERCENTAGE discount type",
        });
      }
    }),
});
