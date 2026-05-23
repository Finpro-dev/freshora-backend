import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "../configs/prisma.config";
import { LoginInput } from "../schemas/login.schema";
import { SignupInput } from "../schemas/signup.schema";
import { TokenPayload } from "../types/token.type";
import { AppError } from "../utils/appErrror.util";
import { formatUserResponse } from "../utils/formatUserResponse";
import { referralCodeGenerator } from "../utils/generateRandom.util";
import { handlePrismaError } from "../utils/prismaErrorHandler.util";
import { generateTokens, verifyRefreshToken } from "../utils/token.util";
import { verifyTokenService } from "./verifyToken.service";
import { emailVerificationTemplate } from "../templates/emailVerification.template";

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

      const fullName = `${isExist?.firstName} ${isExist?.lastName}`;
      const userId = isExist?.userId as string;

      // not verified yet
      if (isExist?.password === null && !isExist.isVerified) {
        await verifyTokenService.createVerifyToken(userId, fullName, email);
        throw new AppError(
          409,
          "User already registered, please check your email to verify",
        );
      }

      // has been verified
      if (isExist?.password && isExist.isVerified)
        throw new AppError(409, "User already registered, please login");

      //check if phone number in db
      const isPhoneNumberUsed = await prisma.user.findUnique({
        where: {
          phone,
        },
      });

      if (isPhoneNumberUsed)
        throw new AppError(409, "Phone number is already used");

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
      const newUser = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email: trimmedEmail,
          phone,
          gender,
          role,
          myReferralCode,
          authProvider: "CREDENTIALS",
        },
      });

      // create and send email verification token
      await verifyTokenService.createVerifyToken(
        newUser.userId,
        fullName,
        email,
      );

      return newUser;
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
    const fullName = `${isValidUser.firstName} ${isValidUser.lastName}`;

    await verifyTokenService.createVerifyToken(userId, fullName, email);
  },

  login: async ({ email, password }: LoginInput) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email,
          isVerified: true,
        },
      });

      if (!user) throw new AppError(404, "Invalid credentials");

      const hashedPassword = user?.password as string;
      const isMatch = await bcrypt.compare(password, hashedPassword);
      console.log("password compare", isMatch);
      if (!isMatch) throw new AppError(401, "Invalid credentials");

      const tokenPayload: TokenPayload = {
        userId: user.userId,
        fullName: `${user.firstName} ${user.lastName}`,
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
