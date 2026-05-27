import { z } from "zod";

export const createTransactionSchema = z.object({
  body: z.object({
    addressId: z
      .string()
      .uuid("Invalid address ID format")
      .min(1, "Address ID is required"),
    courier: z
      .enum(["jne", "tiki", "pos"])
      .refine((val) => ["jne", "tiki", "pos"].includes(val), {
        message: "Courier must be one of: jne, tiki, pos",
      }),
    courierService: z
      .string()
      .min(1, "Courier service is required")
      .max(100, "Courier service must be at most 100 characters"),
    voucherCode: z
      .string()
      .max(8, "Voucher code must be at most 8 characters")
      .optional(),
  }),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>["body"];
