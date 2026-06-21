import { z } from "zod";

export const adminOrderListSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    storeId: z.string().uuid("Invalid store ID format").optional(),
    status: z
      .enum(["WAITING_FOR_PAYMENT", "PROCESSING", "SHIPPING", "COMPLETED", "CANCELED"])
      .optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    sortBy: z.enum(["createdAt", "grandTotal"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),
});

export const adminUpdateOrderStatusSchema = z.object({
  params: z.object({
    transactionId: z.string().uuid("Invalid transaction ID format"),
  }),
});

export const adminCancelOrderSchema = z.object({
  params: z.object({
    transactionId: z.string().uuid("Invalid transaction ID format"),
  }),
});

export const adminOrderDetailSchema = z.object({
  params: z.object({
    transactionId: z.string().uuid("Invalid transaction ID format"),
  }),
});

export type AdminOrderListInput = z.infer<typeof adminOrderListSchema>["query"];
export type AdminUpdateOrderStatusInput = z.infer<typeof adminUpdateOrderStatusSchema>;
export type AdminCancelOrderInput = z.infer<typeof adminCancelOrderSchema>;
export type AdminOrderDetailInput = z.infer<typeof adminOrderDetailSchema>["params"];