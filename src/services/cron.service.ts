import { prisma } from "../configs/prisma.config";
import { handlePrismaError } from "../utils/prismaErrorHandler.util";
import { cancelTransaction } from "../utils/cancelTransaction.util";

export const cronService = {
  // Auto-confirms orders
  autoConfirmExpiredOrders: async (): Promise<number> => {
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const result = await prisma.$transaction(async (tx) => {
        const expiredOrders = await tx.transaction.findMany({
          where: {
            transactionStatus: "SHIPPING",
            shippedAt: { lt: sevenDaysAgo },
            deletedAt: null,
          },
        });

        if (expiredOrders.length === 0) return 0;

        await tx.transaction.updateMany({
          where: {
            transactionId: { in: expiredOrders.map((o) => o.transactionId) },
          },
          data: {
            transactionStatus: "COMPLETED",
            completedAt: new Date(),
          },
        });

        return expiredOrders.length;
      });

      return result;
    } catch (error) {
      handlePrismaError(error);
      return 0; // unreachable, satisfies TypeScript
    }
  },

  // Auto-cancels unpaid transactions
  autoCancelExpiredPayments: async (): Promise<number> => {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const expiredPayments = await tx.payment.findMany({
          where: {
            paymentStatus: "PENDING",
            expiresAt: { lt: new Date() },
            transaction: {
              transactionStatus: "WAITING_FOR_PAYMENT",
              deletedAt: null,
            },
          },
          include: { transaction: { select: { transactionId: true, storeId: true } } },
        });

        if (expiredPayments.length === 0) return 0;

        await Promise.all(
          expiredPayments.map((payment) =>
            cancelTransaction(payment.transaction.transactionId, payment.transaction.storeId, tx, "EXPIRED")
          )
        );

        return expiredPayments.length;
      });

      return result;
    } catch (error) {
      handlePrismaError(error);
      return 0;
    }
  },
};