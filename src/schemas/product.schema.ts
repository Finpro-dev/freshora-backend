import { z } from "zod";

const UnitEnum = z.enum(["PCS", "PACK"]);
const GradeEnum = z.enum(["A", "B", "C"]);
const DietTypeEnum = z.enum(["VEGAN", "VEGETARIAN", "GLUTEN_FREE", "HALAL"]);

export const createProductSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(1, "Product name is required")
      .max(30, "Product name must be at most 30 characters"),

    productCategoryId: z.string().uuid(),

    price: z.coerce
      .number()
      .positive("Price must be greater than 0")
      .max(50000000)
      .multipleOf(0.01),

    description: z.string().trim().min(1, "Description is required").max(500),

    weightPerGram: z.coerce.number().positive().max(1000),

    unit: UnitEnum,

    storageInstructions: z.string().trim().max(150).optional(),

    grade: GradeEnum,

    dietType: DietTypeEnum,

    images: z
      .array(z.object({ filename: z.string(), path: z.string() }))
      .min(1, "At least one product image is required")
      .max(5, "At most 5 product images are allowed"),
  }),
});

export const updateProductSchema = z.object({
  // Validasi ID yang ada di URL /api/products/:productId
  params: z.object({
    productId: z.string().uuid("Invalid Product ID format"),
  }),

  // Validasi data yang dikirim untuk diubah
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(1, "Product name cannot be empty")
        .max(30, "Product name must be at most 30 characters")
        .optional(), // Dibuat optional agar bisa update salah satu saja

      productCategoryId: z.string().uuid().optional(),

      price: z.coerce
        .number()
        .positive("Price must be greater than 0")
        .max(50000000)
        .multipleOf(0.01)
        .optional(),

      description: z.string().trim().min(1).max(500).optional(),

      weightPerGram: z.coerce.number().positive().max(1000).optional(),

      unit: UnitEnum.optional(),

      storageInstructions: z.string().trim().max(150).optional(),

      grade: GradeEnum.optional(),

      dietType: DietTypeEnum.optional(),

      images: z
        .array(z.object({ filename: z.string(), path: z.string() }))
        .min(1)
        .max(5)
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
});

export const deleteProductSchema = z.object({
  params: z.object({
    productId: z.string().uuid("Invalid Product ID format"),
  }),
});

export const productQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
    limit: z.coerce
      .number()
      .int()
      .min(1, "Limit must be at least 1")
      .max(100, "Limit cannot exceed 100")
      .default(10),
    search: z.string().trim().optional(),
    category: z.string().uuid("Invalid category ID format").optional(),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>["body"];
export type UpdateProductInput = z.infer<typeof updateProductSchema>["body"];
export type DeleteProductInput = z.infer<typeof deleteProductSchema>["params"];
export type ProductParamsInput = z.infer<typeof productQuerySchema>["query"];
