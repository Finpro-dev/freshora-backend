import { z } from "zod";

export const getUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(10),

    role: z.enum(["CUSTOMER", "STORE_ADMIN"]).optional(),
  }),
});

export type GetUsersQuery = z.infer<typeof getUsersSchema>["query"];
