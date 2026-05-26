import { z } from "zod";

const UnitEnum = z.enum(["KG", "G", "PCS", "PACK"]);
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

export type CreateProductInput = z.infer<typeof createProductSchema>["body"];
