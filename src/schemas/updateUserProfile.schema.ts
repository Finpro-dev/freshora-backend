import { z } from "zod";

const GenderEnum = z.enum(["MALE", "FEMALE"]);

const phoneRegex = /^(?:\+62|62|08)[2-9]\d{7,11}$/;

export const updateUserProfileSchema = z.object({
  body: z.object({
    firstName: z
      .string()
      .trim()
      .min(1, "First name is required")
      .max(30, "First name must be at most 30 characters")
      .toLowerCase()
      .optional(),

    lastName: z
      .string()
      .trim()
      .min(1, "Last name is required")
      .max(30, "Last name must be at most 30 characters")
      .toLowerCase()
      .optional(),

    email: z
      .email("Invalid email format")
      .trim()
      .toLowerCase()
      .max(30, "Email must be at most 30 characters")
      .optional(),

    phone: z
      .string()
      .min(1, { message: "Phone number is required" })
      .min(9, { message: "Phone number is too short" })
      .max(15, { message: "Phone number cannot exceed 15 characters" })
      .regex(phoneRegex, {
        message: "Invaid phone number format. Use 08... or +62...",
      })
      .optional(),

    avatar: z.string().optional(),

    gender: GenderEnum.optional(),
  }),
});

export type UpdateUserProfileInput = z.infer<
  typeof updateUserProfileSchema
>["body"];
