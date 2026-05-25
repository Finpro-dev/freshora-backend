import { Prisma } from "../../generated/prisma/client";
import { referralCodeGenerator } from "./generateRandom.util";

export const createUniqueReferralCode = async (
  tx: Prisma.TransactionClient,
) => {
  let myReferralCode = "";
  let isUnique = false;

  while (!isUnique) {
    myReferralCode = referralCodeGenerator();
    const referralCodeUsed = await tx.user.findFirst({
      where: { myReferralCode },
    });

    if (!referralCodeUsed) {
      isUnique = true;
    }
  }

  return myReferralCode;
};
