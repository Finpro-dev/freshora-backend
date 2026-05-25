import { Response } from "express";
import { AuthenticatedRequest } from "../types/appRequest.type";
import { paymentService } from "../services/payment.service";
import { catchAsync } from "../utils/catchAsync.util";
import { prisma } from "../configs/prisma.config";
import { mapMidtransToPaymentStatus } from "../utils/midtransPaymentMapper";

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

      const paymentStatus = req.body.transaction_status;
      const transactionId = req.body.order_id;

      const status = mapMidtransToPaymentStatus(paymentStatus);

      // await prisma.payment.update({
      //   where: {
      //     transactionId,
      //   },

      //   data: {
      //     paymentStatus: status,
      //   },
      // });

      // if (status === "SETTLEMENT") {
      //   await prisma.storeOrder.updateMany({
      //     where: {
      //       transactionId,
      //     },

      //     data: {
      //       transactionStatus: "PROCESSING",
      //     },
      //   });
      // }
      res.status(200).json({
        status: "success",
        message: "Payment updated successfully",
      });
    },
  ),
};
