import { z } from "zod";

// Schema for adding a product to the cart.
export const addToCartSchema = z.object({
  body: z.object({
    productId: z.string().uuid({ error: "Invalid product ID format" }),
    storeId: z.string().uuid({ error: "Invalid store ID format" }).optional(),
    quantity: z
      .number()
      .int("Quantity must be an integer")
      .min(1, "Quantity must be at least 1")
      .max(1000, "Quantity must be at most 1000"),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
});

// Schema for updating a cart item's quantity.
export const updateCartSchema = z.object({
  body: z.object({
    quantity: z
      .number()
      .int("Quantity must be an integer")
      .min(1, "Quantity must be at least 1")
      .max(1000, "Quantity must be at most 1000"),
    operation: z.enum(["set", "increase", "decrease"]).describe(
      "set = replace quantity, increase = add quantity, decrease = reduce quantity",
    ),
  }),
  params: z.object({
    cartItemId: z.string().uuid({ error: "Invalid cart item ID format" }),
  }),
});

// Schema for pagination query parameters.
export const paginationSchema = z.object({
  query: z.object({
    page: z
      .number()
      .int("Page must be an integer")
      .positive("Page must be greater than 0")
      .default(1),
    limit: z
      .number()
      .int("Limit must be an integer")
      .positive("Limit must be greater than 0")
      .max(100, "Limit must be at most 100")
      .default(10),
  }),
});

// Inferred TypeScript types
export type AddToCartInput = z.infer<typeof addToCartSchema>["body"];
export type UpdateCartInput = z.infer<typeof updateCartSchema>["body"];
export type PaginationInput = z.infer<typeof paginationSchema>["query"];