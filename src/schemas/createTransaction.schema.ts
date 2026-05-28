import { z } from "zod";

export const createTransactionSchema = z.object({
  body: z.object({
    addressId: z
      .uuid("Invalid address ID format")
      .min(1, "Address ID is required"),
    referralVoucherId: z
      .string()
      .max(8, "Voucher code must be at most 8 characters")
      .optional(),
    freeShippingVoucherId: z.uuid("Invalid address ID format").optional(),
  }),
});

export type CreateTransactionInput = z.infer<
  typeof createTransactionSchema
>["body"];
