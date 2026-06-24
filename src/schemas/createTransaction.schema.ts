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
    courier: z.string("Invalid courier"),
  }),
});

export const cancelOrderSchema = z.object({
  params: z.object({
    transactionId: z.string().uuid("Invalid transaction ID format"),
  }),
});

export const confirmOrderSchema = z.object({
  params: z.object({
    transactionId: z.string().uuid("Invalid transaction ID format"),
  }),
});

export const getOrderListSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z
      .enum([
        "WAITING_FOR_PAYMENT",
        "PROCESSING",
        "SHIPPING",
        "COMPLETED",
        "CANCELED",
      ])
      .optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    sortBy: z.enum(["createdAt", "grandTotal"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),
});

export type CreateTransactionInput = z.infer<
  typeof createTransactionSchema
>["body"];
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>["params"];
export type ConfirmOrderInput = z.infer<typeof confirmOrderSchema>["params"];
export type GetOrderListInput = z.infer<typeof getOrderListSchema>["query"];
