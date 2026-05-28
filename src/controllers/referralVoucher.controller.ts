import { Request, Response } from "express";
// import { AuthenticatedRequest } from "../types/appRequest.type";
import { catchAsync } from "../utils/catchAsync.util";
import { referralVoucherService } from "../services/referralVoucher.service";

export const referralVoucherController = {
  getReferralVoucherDetails: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;

    const referralVoucher =
      await referralVoucherService.getReferralVoucherDetails(userId);

    res.status(200).json({
      status: "success",
      message: "Referral vouhcer details is retrieved successfully",
      data: referralVoucher,
    });
  }),
};
