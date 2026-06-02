import { Request, Response } from "express";
import { paymentService } from "../services/payment.service";
import { catchAsync } from "../utils/catchAsync.util";

export const paymentController = {
  // Midtrans webhook endpoint (no auth)
  webhookMidtrans: catchAsync(async (req: Request, res: Response) => {
    console.log(req.body);
    await paymentService.processMidtransWebhook(req.body);

    res.status(200).json({
      status: "success",
      message: "Webhook processed successfully",
    });
  }),
};
