import { z } from "zod";

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z
      .email("Invalid email format")
      .trim()
      .toLowerCase()
      .max(30, "Email must be at most 30 characters"),
  }),
});

export const setNewPasswordSchema = z.object({
  params: z.object({
    token: z.string("Token must be a string").trim(),
  }),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>["body"];
export type SetNewPasswordParams = z.infer<
  typeof setNewPasswordSchema
>["params"];
