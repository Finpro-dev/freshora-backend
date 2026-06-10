import { z } from "zod";

const VerifyType = z.enum(["VERIFY_PASSWORD", "VERIFY_ONLY"]);

export const verificationRequestSchema = z.object({
  body: z.object({
    email: z
      .email("Invalid email format")
      .trim()
      .toLowerCase()
      .max(30, "Email must be at most 30 characters")
      .optional(),

    verifyType: VerifyType.optional(),
  }),
});

export type VerificationRequestInput = z.infer<
  typeof verificationRequestSchema
>["body"];
