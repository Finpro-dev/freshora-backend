import { Response } from "express";
import { AuthenticatedRequest } from "../types/appRequest.type";
import { catchAsync } from "../utils/catchAsync.util";
import { freeShippingService } from "../services/freeShipping.service";

export const freeShippingController = {
  retrieveUserFreeShipping: catchAsync(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user?.userId as string;

      const freeShippingVoucher =
        await freeShippingService.freeShippingVoucher(userId);
      res.status(200).json({
        status: "success",
        message: "Free shipping voucher is retrieved successfully",
        data: freeShippingVoucher,
      });
    },
  ),
};
