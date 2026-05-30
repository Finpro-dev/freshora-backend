import { prisma } from "../configs/prisma.config";
import { FREE_SHIPPING_VOUCHER_MULTIPLIER_BASE } from "../statics/freeShipping.static";
import { handlePrismaError } from "../utils/prismaErrorHandler.util";

export const freeShippingService = {
  freeShippingVoucher: async (userId: string) => {
    try {
      const freeShippingVoucher = await prisma.$transaction(async (tx) => {
        // get current user total transactions
        const totalUserTransactions = await tx.transaction.count({
          where: {
            userId,
            transactionStatus: "COMPLETED",
          },
        });

        // check if it's not 0 &  multiplier of 5
        if (
          !!totalUserTransactions &&
          totalUserTransactions % FREE_SHIPPING_VOUCHER_MULTIPLIER_BASE === 0
        ) {
          const isVoucherExist = await tx.freeShippingVoucher.findFirst({
            where: {
              userId,
              transactionId: null,
            },
          });

          const isCurrentSlotUsed = await tx.freeShippingVoucher.findFirst({
            where: {
              userId,
              currentTotalTransactions: totalUserTransactions,
              transactionId: { not: null },
            },
          });

          if (isCurrentSlotUsed) return null;

          // if exist and have not used yet -> update
          if (isVoucherExist) {
            return await tx.freeShippingVoucher.update({
              where: {
                freeShippingVoucherId: isVoucherExist.freeShippingVoucherId,
              },
              data: {
                currentTotalTransactions: totalUserTransactions,
              },
            });

            // if not --> create new
          } else {
            return await tx.freeShippingVoucher.create({
              data: {
                userId,
                transactionId: null,
                currentTotalTransactions: totalUserTransactions,
              },
            });
          }
        }
      });

      return freeShippingVoucher || null;
    } catch (error) {
      handlePrismaError(error);
    }
  },
};
