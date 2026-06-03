import { z } from "zod";

export const createTransactionSchema = z.object({
  body: z.object({
    addressId: z
      .uuid("Invalid address ID format")
      .min(1, "Address ID is required"),
    referralVoucherId: z.uuid("Invalid referral voucher ID format").optional(),
    freeShippingVoucherId: z
      .uuid("Invalid free shipping voucher ID format")
      .optional(),
  }),
});

export type CreateTransactionInput = z.infer<
  typeof createTransactionSchema
>["body"];
