import bcrypt from "bcrypt";
import crypto from "crypto";
import { addMonths } from "date-fns";
import { prisma } from "../configs/prisma.config";
import { LoginInput } from "../schemas/login.schema";
import { SignupInput } from "../schemas/signup.schema";
import { REFERRAL_VOUCHER_PERCENTAGE } from "../statics/referralVoucher.static";
import { TokenPayload } from "../types/token.type";
import { AppError } from "../utils/appErrror.util";
import { createUniqueCouponCode } from "../utils/createUniqueCouponCode";
import { createUniqueReferralCode } from "../utils/createUniqueReferralCode";
import { formatUserResponse } from "../utils/formatUserResponse";
import { handlePrismaError } from "../utils/prismaErrorHandler.util";
import { generateTokens, verifyRefreshToken } from "../utils/token.util";
import { generateFullName } from "../utils/userDataTransform.util";
import { verifyTokenService } from "./verifyToken.service";

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

      let fullName = "";

      // exist & not verified yet
      if (isExist && !isExist.password && !isExist.isVerified) {
        fullName = generateFullName(isExist?.firstName, isExist?.lastName);
        const userId = isExist?.userId as string;

        await verifyTokenService.createVerifyToken(userId, fullName, email);

        throw new AppError(
          409,
          "User already registered, please check your email to verify",
        );
      }

      // exist & has been verified
      if (isExist && isExist.password && isExist.isVerified)
        throw new AppError(409, "User already registered, please login");

      //check if phone number in db
      const isPhoneNumberUsed = await prisma.user.findUnique({
        where: {
          phone,
        },
      });

      if (isPhoneNumberUsed)
        throw new AppError(409, "Phone number is already used");

      // prisma transactions
      const newUser = await prisma.$transaction(
        async (tx) => {
          // check if used referral code correct
          let referralOwnerId = "";
          if (usedReferralCode) {
            const isCorrectUsedReferralCode = await tx.user.findUnique({
              where: {
                myReferralCode: usedReferralCode,
                role: "CUSTOMER",
              },
            });

            if (!isCorrectUsedReferralCode)
              throw new AppError(400, "Incorrect referral code");

            referralOwnerId = isCorrectUsedReferralCode.userId;
          }

          // create unique referral code
          const myReferralCode = await createUniqueReferralCode(tx);

          // create new user
          const newUser = await tx.user.create({
            data: {
              firstName,
              lastName,
              email: trimmedEmail,
              phone,
              gender,
              role,
              myReferralCode,
              ...(usedReferralCode && { usedReferralCode }),
              authProvider: "CREDENTIALS",
            },
          });

          if (usedReferralCode) {
            // create unique coupon code
            const couponCode = await createUniqueCouponCode(tx);

            // create new referral voucher
            await tx.referralVoucher.create({
              data: {
                couponCode,
                discountAmount: REFERRAL_VOUCHER_PERCENTAGE,
                validFrom: new Date(),
                validUntil: addMonths(new Date(), 3),
                userId: newUser.userId,
                referralOwnerId,
              },
            });
          }

          // create and send email verification token
          await verifyTokenService.createVerifyToken(
            newUser.userId,
            fullName,
            email,
            "VERIFY_PASSWORD",
            tx,
          );

          return newUser;
        },
        {
          timeout: 15000,
        },
      );

      return formatUserResponse(newUser);
    } catch (error) {
      handlePrismaError(error);
    }
  },

  verifyRequest: async (email: string) => {
    // find user
    const isValidUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!isValidUser) throw new AppError(400, "User is not found");

    if (isValidUser.isVerified && isValidUser.password !== null)
      throw new AppError(400, "Your account has been verified, please login");

    // find if there's an active link
    const isPrevLinkActive = await prisma.verification.findFirst({
      where: {
        userId: isValidUser.userId,
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
    const userId = isValidUser.userId;
    const fullName = generateFullName(
      isValidUser.firstName,
      isValidUser.lastName,
    );

    await verifyTokenService.createVerifyToken(userId, fullName, email);
  },

  login: async ({ email, password }: LoginInput) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) throw new AppError(404, "Invalid credentials");

      const hashedPassword = user?.password as string;
      const isMatch = await bcrypt.compare(password, hashedPassword);

      if (!isMatch) throw new AppError(400, "Invalid credentials");

      const tokenPayload: TokenPayload = {
        userId: user.userId,
        fullName: generateFullName(user.firstName, user.lastName),
        role: user.role,
      };

      const { accessToken, refreshToken } = await generateTokens(tokenPayload);

      return { user: formatUserResponse(user), accessToken, refreshToken };
    } catch (error) {
      handlePrismaError(error);
    }
  },

  logout: async (userId: string) => {
    try {
      await prisma.refreshToken.deleteMany({
        where: {
          userId,
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  },

  refresh: async (storedRefreshToken: string) => {
    try {
      // check refresh token including expiresIn
      const decoded = verifyRefreshToken(storedRefreshToken);

      const tokenPayload = {
        userId: decoded.userId,
        fullName: decoded.fullName,
        role: decoded.role,
      };

      const hashedStoredToken = crypto
        .createHash("sha256")
        .update(storedRefreshToken)
        .digest("hex");

      // double check expiresAt in DB to syncronize
      const targetRefreshToken = await prisma.refreshToken.findFirst({
        where: {
          token: hashedStoredToken,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!targetRefreshToken)
        throw new AppError(
          401,
          "Refresh token has been expired, please re-login",
        );

      const { accessToken, refreshToken } = await prisma.$transaction(
        async (tx) => {
          await tx.refreshToken.updateMany({
            where: {
              userId: decoded.userId,
            },

            data: {
              revoked: true,
            },
          });

          return await generateTokens(tokenPayload, tx);
        },
      );

      return { accessToken, refreshToken };
    } catch (error) {
      handlePrismaError(error);
    }
  },
};
