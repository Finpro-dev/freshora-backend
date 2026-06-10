import { Request, Response } from "express";
import { paymentService } from "../services/payment.service";
import { catchAsync } from "../utils/catchAsync.util";

export const paymentController = {
  webhookMidtrans: catchAsync(async (req: Request, res: Response) => {
    await paymentService.processMidtransWebhook(req.body);

    res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
    });
  }),
};