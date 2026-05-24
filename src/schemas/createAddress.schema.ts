import { z } from "zod";

const AddressStatusEnum = z.enum(["PRIMARY", "SECONDARY"]);

export const createAddressSchema = z.object({
  body: z.object({
    address: z
      .string()
      .min(5, "Address must be at least 5 characters long")
      .max(100, "Address cannot exceed 100 characters"),

    district: z
      .string()
      .min(2, "District name is too short")
      .max(50, "District cannot exceed 50 characters"),

    city: z
      .string()
      .min(2, "City name is too short")
      .max(50, "City cannot exceed 50 characters"),

    province: z
      .string()
      .min(2, "Province name is too short")
      .max(50, "Province cannot exceed 50 characters"),

    postalCode: z
      .string()
      .length(5, "Postal code must be exactly 5 digits")
      .regex(/^\d+$/, "Postal code must contain numbers only"),

    addressStatus: AddressStatusEnum.default("SECONDARY"),

    latitude: z
      .number("Latitude must be a decimal/float number")
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90")
      .optional()
      .nullable(),

    longitude: z
      .number("Longitude must be a decimal/float number")
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180")
      .optional()
      .nullable(),
  }),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>["body"];
