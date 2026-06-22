import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.util";
import { referralVoucherService } from "../services/referralVoucher.service";

export const referralVoucherController = {
  getReferralVoucherDetails: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;

    const referralVoucher =
      await referralVoucherService.getReferralVoucherDetails(userId);

    res.status(200).json({
      success: true,
      message: "Referral voucher details is retrieved successfully",
      data: referralVoucher,
    });
  }),
};
