import { z } from "zod";

export const verificationRequestSchema = z.object({
  body: z.object({
    email: z
      .email("Invalid email format")
      .trim()
      .toLowerCase()
      .max(30, "Email must be at most 30 characters"),
  }),
});

export type VerificationRequestInput = z.infer<
  typeof verificationRequestSchema
>["body"];
