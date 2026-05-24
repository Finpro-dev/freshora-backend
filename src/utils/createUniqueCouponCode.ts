import { Prisma } from "../../generated/prisma/client";
import { generateCouponCode } from "./generateRandom.util";

export const createUniqueCouponCode = async (tx: Prisma.TransactionClient) => {
  // create unique coupon code
  let couponCode = "";
  let isUnique = false;

  while (!isUnique) {
    couponCode = generateCouponCode();
    const referralCodeUsed = await tx.referralVoucher.findUnique({
      where: { couponCode },
    });

    if (!referralCodeUsed) {
      isUnique = true;
    }
  }

  return couponCode;
};
