import { z } from "zod";

export const createPasswordSchema = z
  .object({
    body: z.object({
      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(255, "Password too long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(
          /[^A-Za-z0-9]/,
          "Password must contain at least one special character",
        ),
      confirmPassword: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(255, "Password too long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(
          /[^A-Za-z0-9]/,
          "Password must contain at least one special character",
        ),
    }),
  })
  .refine((data) => data.body.password === data.body.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type CreatePasswordInput = z.infer<typeof createPasswordSchema>["body"];
