import { Response } from "express";
import { AuthenticatedRequest } from "../types/appRequest.type";
import { paymentService } from "../services/payment.service";

export const paymentController = {
  createPayment: async (req: AuthenticatedRequest, res: Response) => {
    const transactionToken = await paymentService.createPayment();

    res.status(201).json({
      status: "success",
      token: transactionToken,
      message: "Token created successfully",
    });
  },
};
