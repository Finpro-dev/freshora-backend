import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "../configs/prisma.config";
import { SignupInput } from "../schemas/signup.schema";
import { HASH_SALT } from "../statics/token.static";
import { AppError } from "../utils/appErrror.util";
import { formatUserResponse } from "../utils/formatUserResponse";
import { referralCodeGenerator } from "../utils/generateRandom.util";
import { handlePrismaError } from "../utils/prismaErrorHandler.util";
import { generateRawToken } from "../utils/token.util";

export const authServices = {
  signup: async (data: SignupInput) => {
    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        gender,
        role,
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
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          },
        });

        return formatUserResponse(newUser, { token: newToken });
      });

      return newUserCredentials;
    } catch (error) {
      handlePrismaError(error);
    }
  },

  createPassword: async (password: string, token: string) => {
    try {
      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      // search token
      const isValidToken = await prisma.verification.findFirst({
        where: {
          hashedToken,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!isValidToken)
        throw new AppError(
          401,
          "Link has expired, request new verification link",
        );

      const hashedPassword = await bcrypt.hash(password, HASH_SALT);

      await prisma.$transaction(async (tx) => {
        // input password to db
        await tx.user.update({
          where: {
            userId: isValidToken.userId,
          },

          data: {
            password: hashedPassword,
            isVerified: true,
          },
        });

        // delete after using
        await tx.verification.deleteMany({
          where: {
            userId: isValidToken.userId,
          },
        });
      });
    } catch (error) {
      handlePrismaError(error);
    }
  },

  verifyRequest: async (userId: string) => {
    // find user
    const isValidUser = await prisma.user.findUnique({
      where: {
        userId,
      },
    });

    if (!isValidUser) throw new AppError(400, "User is not found");

    if (isValidUser.isVerified)
      throw new AppError(400, "Your account has been verified");

    // find if there's an active link
    const isPrevLinkActive = await prisma.verification.findFirst({
      where: {
        userId,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (isPrevLinkActive)
      throw new AppError(
        403,
        "Your previous link is still active, check your email",
      );

    // create email verification token
    const newToken = generateRawToken();
    const hashedToken = crypto
      .createHash("sha256")
      .update(newToken)
      .digest("hex");

    await prisma.verification.create({
      data: {
        userId: userId,
        hashedToken,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    return {
      fullName: `${isValidUser.firstName} ${isValidUser.lastName}`,
      email: isValidUser.email,
      token: newToken,
    };
  },

  login: () => {},
};
