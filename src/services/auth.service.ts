import { prisma } from "../configs/prisma.config";
import { HASH_SALT } from "../statics/token.static";
import { AppError } from "../utils/appErrror.util";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { referralCodeGenerator } from "../utils/generateRandom.util";
import { handlePrismaError } from "../utils/prismaErrorHandler.util";
import { formatUserResponse } from "../utils/formatUserResponse";
import { generateRawToken } from "../utils/token.util";

export const authServices = {
  signup: async (data: any) => {
    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        gender,
        role,
        password,
        usedReferralCode,
      } = data;

      const trimmedEmail = email.trim().toLowerCase();

      // check email in db
      const isExist = await prisma.user.findUnique({
        where: { email: trimmedEmail },
      });

      if (isExist) throw new AppError(409, "User already exist, please login");

      // check if used referral code correct
      if (usedReferralCode) {
        const isCorrectUsedReferralCode = await prisma.user.findUnique({
          where: {
            myReferralCode: usedReferralCode,
          },
        });

        if (!isCorrectUsedReferralCode)
          throw new AppError(400, "Incorrect referral code");
      }

      // hash password
      const hashedPassword = await bcrypt.hash(password, HASH_SALT);

      // create unique referral code
      let myReferralCode = "";
      let isUnique = false;

      while (!isUnique) {
        myReferralCode = referralCodeGenerator();
        const referralCodeUsed = await prisma.user.findFirst({
          where: { myReferralCode },
        });

        if (!referralCodeUsed) {
          isUnique = true;
        }
      }

      // create new user
      const newUserCredentials = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            firstName,
            lastName,
            email: trimmedEmail,
            phone,
            gender,
            role,
            password: hashedPassword,
            myReferralCode,
          },
        });

        // create email verification token
        const newToken = generateRawToken();
        const hashedToken = crypto
          .createHash("sha256")
          .update(newToken)
          .digest("hex");

        await tx.verification.create({
          data: {
            userId: newUser.userId,
            hashedToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
          },
        });

        return formatUserResponse(newUser, { token: newToken });
      });

      return newUserCredentials;
    } catch (error) {
      handlePrismaError(error);
    }
  },
};
