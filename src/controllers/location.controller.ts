import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.util";
import { rajaOngkirService } from "../services/rajaOngkir.service";

export const locationController = {
  getProvinces: catchAsync(async (req: Request, res: Response) => {
    const provinces = await rajaOngkirService.getProvinces();

    res.status(200).json({
      status: "success",
      message: "Provices data retrieved successfully",
      data: provinces,
    });
  }),

  getCityByProvince: catchAsync(async (req: Request, res: Response) => {
    const provinceId = req.params.provinceId as string;
    const cities = await rajaOngkirService.getCityByProvince(provinceId);

    res.status(200).json({
      status: "success",
      message: "Cities data retrieved successfully",
      data: cities,
    });
  }),

  getDistrictByCity: catchAsync(async (req: Request, res: Response) => {
    const cityId = req.params.cityId as string;
    const districts = await rajaOngkirService.getDistrictByCity(cityId);

    res.status(200).json({
      status: "success",
      message: "Districts data retrieved successfully",
      data: districts,
    });
  }),
};
