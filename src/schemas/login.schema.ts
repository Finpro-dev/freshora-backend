import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z
      .email("Invalid email format")
      .trim()
      .toLowerCase()
      .max(30, "Email must be at most 30 characters"),

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
  }),
});

export type LoginInput = z.infer<typeof loginSchema>["body"];
