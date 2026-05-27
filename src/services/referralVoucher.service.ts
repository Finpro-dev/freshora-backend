import { prisma } from "../configs/prisma.config";

export const referralVoucherService = {
  getReferralVoucherDetails: async (userId: string) => {
    const referralVoucher = await prisma.referralVoucher.findFirst({
      where: {
        userId,
        transactionId: null,
      },
    });

    return referralVoucher || null;
  },
};
