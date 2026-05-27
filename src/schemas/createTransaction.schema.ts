import { z } from "zod";

export const createTransactionSchema = z.object({
  body: z.object({
    addressId: z
      .string()
      .uuid("Invalid address ID format")
      .min(1, "Address ID is required"),
    voucherCode: z
      .string()
      .max(8, "Voucher code must be at most 8 characters")
      .optional(),
  }),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>["body"];
