import { z } from "zod";

// Schema for mutation list query
export const mutationListSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    productId: z.string().uuid("Invalid product ID format").optional(),
    status: z.enum(["PENDING", "PROCESSED", "SHIPPING", "REJECTED", "COMPLETED"]).optional(),
    fromStoreId: z.string().uuid("Invalid store ID format").optional(),
    toStoreId: z.string().uuid("Invalid store ID format").optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    sortBy: z.enum(["createdAt", "quantity"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),
});

// Schema for creating/updating mutation
export const createMutationSchema = z.object({
  body: z.object({
    productId: z.string().uuid("Invalid product ID format"),
    fromStoreId: z.string().uuid("Invalid source store ID format"),
    toStoreId: z.string().uuid("Invalid destination store ID format"),
    quantity: z.number().int().positive("Quantity must be positive"),
  }),
});

export const updateMutationSchema = z.object({
  params: z.object({
    mutationId: z.string().uuid("Invalid mutation ID format"),
  }),
  body: z.object({
    status: z.enum(["PROCESSED", "SHIPPING", "REJECTED", "COMPLETED"]),
  }),
});

export const mutationDetailSchema = z.object({
  params: z.object({
    mutationId: z.string().uuid("Invalid mutation ID format"),
  }),
});

// Type exports
export type MutationListInput = z.infer<typeof mutationListSchema>["query"];
export type CreateMutationInput = z.infer<typeof createMutationSchema>["body"];
export type UpdateMutationInput = z.infer<typeof updateMutationSchema>;
export type MutationDetailInput = z.infer<typeof mutationDetailSchema>["params"];