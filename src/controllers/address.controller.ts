import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.util";
import { addressService } from "../services/address.service";
import { CreateAddressInput } from "../schemas/createAddress.schema";
import { EditAddressInput } from "../schemas/editAddressSchema";

export const addressController = {
  createAddress: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const address = await addressService.createAddress(
      userId,
      req.body as CreateAddressInput,
    );

    res.status(201).json({
      success: true,
      message: "Address created successfully",
      data: address,
    });
  }),

  getAllUserAddresses: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const userAddresses = await addressService.getAllUserAddresses(userId);

    res.status(201).json({
      success: true,
      message: "User Addresses retrieved successfully",
      data: userAddresses,
    });
  }),

  getAddressDetails: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const addressId = req.params.addressId as string;

    const address = await addressService.getAddressDetails(userId, addressId);

    res.status(200).json({
      success: true,
      message: "Address retreived successfully",
      data: address,
    });
  }),

  editAddressDetails: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const addressId = req.params.addressId as string;

    const address = await addressService.editAddressDetails(
      userId,
      addressId,
      req.body as EditAddressInput,
    );

    res.status(200).json({
      success: true,
      message: "Address retreived successfully",
      data: address,
    });
  }),

  deleteUserAddress: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const addressId = req.params.addressId as string;

    await addressService.deleteUserAddress(userId, addressId);

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  }),
};
