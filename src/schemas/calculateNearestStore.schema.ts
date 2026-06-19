import { z } from "zod";

export const calculateNearestStore = z.object({
  body: z.object({
    lat: z.coerce
      .number({ message: "Latitude must be a valid number" })
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90")
      .optional()
      .nullable(),

    lng: z.coerce
      .number({ message: "Longitude must be a valid number" })
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180")
      .optional()
      .nullable(),
  }),
});

export type CalculateNearestStore = z.infer<
  typeof calculateNearestStore
>["body"];
