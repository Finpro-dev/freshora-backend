import { z } from "zod";

const monthFilterSchema = z.object({
  year: z.coerce.number().int().min(2020).max(2030).default(new Date().getFullYear()),
  month: z.coerce.number().int().min(0).max(12).optional(),
  storeId: z.string().uuid("Invalid store ID format").optional(),
  productId: z.string().uuid("Invalid product ID format").optional(),
});

export const salesReportSchema = z.object({
  query: monthFilterSchema,
});

export const stockReportSchema = z.object({
  query: monthFilterSchema,
});

export const stockDetailReportSchema = z.object({
  query: z.object({
    year: z.coerce.number().int().min(2020).max(2030).default(new Date().getFullYear()),
    month: z.coerce.number().int().min(0).max(12),
    storeId: z.string().uuid("Invalid store ID format").optional(),
    productId: z.string().uuid("Invalid product ID format").optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
  }),
});

export type SalesReportInput = z.infer<typeof salesReportSchema>["query"];
export type StockReportInput = z.infer<typeof stockReportSchema>["query"];
export type StockDetailReportInput = z.infer<typeof stockDetailReportSchema>["query"];