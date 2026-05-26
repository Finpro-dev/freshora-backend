import { z } from "zod";

const phoneRegex = /^(?:\+62|62|08)[2-9]\d{7,11}$/;

export const createStoreSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, "Store name must be at least 3 characters long")
      .max(30, "Store name cannot exceed 30 characters"),

    address: z
      .string()
      .min(5, "Address must be at least 5 characters long")
      .max(100, "Address cannot exceed 100 characters"),

    districtId: z.number({ message: "District ID must be a valid number" }),

    district: z
      .string()
      .min(2, "District name is too short")
      .max(50, "District cannot exceed 50 characters"),

    cityId: z.number({ message: "City ID must be a valid number" }),

    city: z
      .string()
      .min(2, "City name is too short")
      .max(50, "City cannot exceed 50 characters"),

    provinceId: z.number({ message: "Province ID must be a valid number" }),
    province: z
      .string()
      .min(2, "Province name is too short")
      .max(50, "Province cannot exceed 50 characters"),

    postalCode: z
      .string()
      .length(5, "Postal code must be exactly 5 digits")
      .regex(/^\d+$/, "Postal code must contain numbers only"),

    phone: z
      .string()
      .min(9, "Phone number is too short")
      .max(15, "Phone number cannot exceed 15 characters")
      .regex(phoneRegex, "Phone number must contain numbers only"),

    latitude: z
      .number({ message: "Latitude must be a valid number" })
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90")
      .optional()
      .nullable(),

    longitude: z
      .number({ message: "Longitude must be a valid number" })
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180")
      .optional()
      .nullable(),
  }),
});

export type CreateStoreInput = z.infer<typeof createStoreSchema>["body"];
