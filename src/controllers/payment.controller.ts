import { Response } from "express";
import { AuthenticatedRequest } from "../types/appRequest.type";
import { paymentService } from "../services/payment.service";
import { catchAsync } from "../utils/catchAsync.util";

export const paymentController = {
  createPayment: async (req: AuthenticatedRequest, res: Response) => {
    const transactionToken = await paymentService.createPayment();

    res.status(201).json({
      status: "success",
      token: transactionToken,
      message: "Token created successfully",
    });
  },

  updatePaymentStatusWebhook: catchAsync(
    async (req: AuthenticatedRequest, res: Response) => {
      console.log("MIDTRANS REQ.BODY ==>", req.body);

      res.status(200).json({
        status: "success",
        message: "Payment updated successfully",
      });
    },
  ),
};
