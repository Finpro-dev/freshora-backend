import { z } from "zod";
import { ActivityType } from "../../generated/prisma/client";

export const updateStockSchema = z.object({
  body: z.object({
    productId: z.string().uuid("Invalid product ID"),
    storeId: z.string().uuid("Invalid store ID").optional(),
    quantityChange: z.number().int("Quantity must be an integer"),
    type: z.nativeEnum(ActivityType, { message: "Invalid activity type" }),
  }),
});

export type UpdateStockInput = z.infer<typeof updateStockSchema>["body"];
