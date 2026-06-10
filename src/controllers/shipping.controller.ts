import { Request, Response } from "express";
// import { AuthenticatedRequest } from "../types/appRequest.type";
import { catchAsync } from "../utils/catchAsync.util";
import { rajaOngkirService } from "../services/rajaOngkir.service";

export const shippingController = {
  calculateShippingCost: catchAsync(async (req: Request, res: Response) => {
    const { origin, destination, weight, courier, price } = req.body;
    const cost = await rajaOngkirService.calculateShippingCost({
      origin,
      destination,
      weight,
      courier,
    });
    res.status(200).json({
      success: true,
      message: "Shipping cost calculated successfully",
      shippingCost: cost,
    });
  }),
};
