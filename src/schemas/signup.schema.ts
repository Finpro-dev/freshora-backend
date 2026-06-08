import { z } from "zod";

const GenderEnum = z.enum(["MALE", "FEMALE"]);
const RoleEnum = z.enum(["CUSTOMER", "STORE_ADMIN"]);

const phoneRegex = /^(?:\+62|62|08)[2-9]\d{7,11}$/;

export const signupSchema = z.object({
  body: z.object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .trim()
      .toLowerCase()
      .max(30, "First name must be at most 30 characters"),

    lastName: z
      .string()
      .min(1, "Last name is required")
      .trim()
      .toLowerCase()
      .max(30, "Last name must be at most 30 characters"),

    email: z
      .email("Invalid email format")
      .trim()
      .toLowerCase()
      .max(30, "Email must be at most 30 characters"),

    phone: z
      .string()
      .min(1, { message: "Phone number is required" })
      .min(9, { message: "Phone number is too short" })
      .max(15, { message: "Phone number cannot exceed 15 characters" })
      .regex(phoneRegex, {
        message: "Invalid phone number format. Use 08... or +62...",
      }),

    gender: GenderEnum,

    role: RoleEnum,

    usedReferralCode: z
      .string()
      .trim()
      .max(30, "Referral code too long")
      .optional()
      .nullable(),
  }),
});

export type SignupInput = z.infer<typeof signupSchema>["body"];
