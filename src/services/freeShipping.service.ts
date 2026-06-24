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

        console.log("total trx", totalUserTransactions);

        // check if it's not 0 & multiplier of 5
        if (
          totalUserTransactions > 0 &&
          totalUserTransactions % FREE_SHIPPING_VOUCHER_MULTIPLIER_BASE === 0
        ) {
          // KUNCI UTAMA: Cari berdasarkan angka kelipatan transaksi saat ini
          // Ini mencegah sistem membuat voucher baru jika kelipatan ini sudah pernah diproses
          const isSlotAlreadyRewarded = await tx.freeShippingVoucher.findFirst({
            where: {
              userId,
              currentTotalTransactions: totalUserTransactions,
            },
          });

          if (isSlotAlreadyRewarded) {
            return isSlotAlreadyRewarded;
          }

          // Jika belum pernah mendapatkan voucher untuk slot kelipatan ini, buat baru
          return await tx.freeShippingVoucher.create({
            data: {
              userId,
              transactionId: null,
              currentTotalTransactions: totalUserTransactions,
            },
          });
        }

        // Kembalikan null jika total transaksi bukan kelipatan 5 atau masih 0
        return null;
      });

      return freeShippingVoucher || null;
    } catch (error) {
      handlePrismaError(error);
      return null;
    }
  },
};
