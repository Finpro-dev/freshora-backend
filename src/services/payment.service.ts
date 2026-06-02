import { prisma } from "../configs/prisma.config";
import { AppError } from "../utils/appErrror.util";
import { handlePrismaError } from "../utils/prismaErrorHandler.util";
import {
  mapMidtransStatus,
  rollbackPaymentStock,
  updateOrderPaymentStatus,
} from "../utils/paymentHelper.util";

export const paymentService = {
  processMidtransWebhook: async (payload: any): Promise<void> => {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { transactionNumber: payload.order_id },
      });

      if (!transaction) throw new AppError(404, "Transaction not found");

      const { transactionStatus, paymentStatus } = mapMidtransStatus(
        payload.transaction_status,
      );

      console.log(payload.transaction_status);
      console.log(transactionStatus);
      console.log(paymentStatus);

      await prisma.$transaction(async (tx) => {
        await updateOrderPaymentStatus(
          transaction.transactionId,
          transactionStatus,
          paymentStatus,
          payload.payment_type,
          tx,
        );

        // Rollback stock if payment denied
        if (
          paymentStatus === "DENIED" &&
          transaction.transactionStatus !== "CANCELED"
        ) {
          await rollbackPaymentStock(transaction.transactionId, tx);
        }

        // Rollback stock if payment expired
        if (
          paymentStatus === "EXPIRED" &&
          transaction.transactionStatus !== "CANCELED"
        ) {
          await rollbackPaymentStock(transaction.transactionId, tx);
        }
      });
    } catch (error) {
      handlePrismaError(error);
    }
  },
};
