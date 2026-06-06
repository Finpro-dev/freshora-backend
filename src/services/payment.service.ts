import { prisma } from "../configs/prisma.config";
import { AppError } from "../utils/appErrror.util";
import { handlePrismaError } from "../utils/prismaErrorHandler.util";
import {
  mapMidtransStatus,
  rollbackOrder,
  updateOrderPaymentStatus,
} from "../utils/paymentHelper.util";

export const paymentService = {
  processMidtransWebhook: async (payload: any): Promise<void> => {
    try {
      // Find transaction by order_id, exclude soft-deleted
      const transaction = await prisma.transaction.findFirst({
        where: { transactionNumber: payload.order_id, deletedAt: null },
      });

      if (!transaction) throw new AppError(404, "Transaction not found");

      const { transactionStatus, paymentStatus } = mapMidtransStatus(
        payload.transaction_status,
      );

      await prisma.$transaction(async (tx) => {
        // Update transaction and payment status
        await updateOrderPaymentStatus(
          transaction.transactionId,
          transactionStatus,
          paymentStatus,
          payload.payment_type,
          tx,
        );

        // Rollback stock if payment is denied or expired
        if (
          (paymentStatus === "DENIED" || paymentStatus === "EXPIRED") &&
          transaction.transactionStatus !== "CANCELED"
        ) {
          await rollbackOrder(
            transaction.transactionId,
            transaction.storeId,
            tx,
          );
        }
      });
    } catch (error) {
      handlePrismaError(error);
    }
  },
};