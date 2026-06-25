import { z } from "zod";

const phoneRegex = /^(?:\+62|62|08)[2-9]\d{7,11}$/;

export const editStoreSchma = z
  .object({
    body: z.object({
      name: z
        .string()
        .min(3, "Store name must be at least 3 characters long")
        .max(30, "Store name cannot exceed 30 characters")
        .optional(),

      userId: z.uuid("Invalid user Id").optional().nullable(),

      address: z
        .string()
        .min(5, "Address must be at least 5 characters long")
        .max(100, "Address cannot exceed 100 characters")
        .optional(),

      districtId: z.coerce
        .number({ message: "District ID must be a valid number" })
        .optional(),

      district: z
        .string()
        .min(2, "District name is too short")
        .max(50, "District cannot exceed 50 characters")
        .optional(),

      cityId: z.coerce
        .number({ message: "City ID must be a valid number" })
        .optional(),

      city: z
        .string()
        .min(2, "City name is too short")
        .max(50, "City cannot exceed 50 characters")
        .optional(),

      provinceId: z.coerce
        .number({ message: "Province ID must be a valid number" })
        .optional(),

      province: z
        .string()
        .min(2, "Province name is too short")
        .max(50, "Province cannot exceed 50 characters")
        .optional(),

      postalCode: z
        .string()
        .length(5, "Postal code must be exactly 5 digits")
        .regex(/^\d+$/, "Postal code must contain numbers only")
        .optional(),

      phone: z
        .string()
        .min(9, "Phone number is too short")
        .max(15, "Phone number cannot exceed 15 characters")
        .regex(phoneRegex, "Phone number must contain numbers only")
        .optional(),

      latitude: z.coerce
        .number({ message: "Latitude must be a valid number" })
        .min(-90, "Latitude must be between -90 and 90")
        .max(90, "Latitude must be between -90 and 90")
        .optional()
        .nullable(),

      longitude: z.coerce
        .number({ message: "Longitude must be a valid number" })
        .min(-180, "Longitude must be between -180 and 180")
        .max(180, "Longitude must be between -180 and 180")
        .optional()
        .nullable(),
    }),
  })
  .superRefine((data, ctx) => {
    const { provinceId, province, cityId, city, districtId, district } =
      data.body;

    if (provinceId && !province) {
      ctx.addIssue({
        code: "custom",
        message: "Province name is required when provinceId is provided",
        path: ["query", "province"],
      });
    }
    if (!provinceId && province) {
      ctx.addIssue({
        code: "custom",
        message: "Province ID is required when province name is provided",
        path: ["query", "provinceId"],
      });
    }

    if (cityId && !city) {
      ctx.addIssue({
        code: "custom",
        message: "City name is required when cityId is provided",
        path: ["query", "city"],
      });
    }
    if (!cityId && city) {
      ctx.addIssue({
        code: "custom",
        message: "City ID is required when city name is provided",
        path: ["query", "cityId"],
      });
    }

    if (districtId && !district) {
      ctx.addIssue({
        code: "custom",
        message: "District name is required when districtId is provided",
        path: ["query", "district"],
      });
    }
    if (!districtId && district) {
      ctx.addIssue({
        code: "custom",
        message: "District ID is required when district name is provided",
        path: ["query", "districtId"],
      });
    }
  });

export type EditStoreInput = z.infer<typeof editStoreSchma>["body"];
