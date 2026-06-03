import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    category: z
      .string()
      .min(3, "Category name must be at least 3 characters long")
      .max(30, "Category name cannot exceed 30 characters"),
  }),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>["body"];
