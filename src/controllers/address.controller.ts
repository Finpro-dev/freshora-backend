import { Response } from "express";
import { AuthenticatedRequest } from "../types/appRequest.type";
import { catchAsync } from "../utils/catchAsync.util";
import { addressService } from "../services/address.service";
import { CreateAddressInput } from "../schemas/createAddress.schema";

export const addressController = {
  createAddress: catchAsync(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user?.userId as string;
      const address = await addressService.createAddress(
        userId,
        req.body as CreateAddressInput,
      );

      res.status(201).json({
        status: "success",
        message: "Address created successfully",
        data: address,
      });
    },
  ),

  getAllUserAddresses: catchAsync(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user?.userId as string;
      const userAddresses = await addressService.getAllUserAddresses(userId);

      res.status(201).json({
        status: "success",
        message: "User Addresses retrieved successfully",
        data: userAddresses,
      });
    },
  ),
};
