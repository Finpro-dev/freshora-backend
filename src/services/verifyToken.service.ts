import { prisma } from "../configs/prisma.config";
import { generateRawToken } from "../utils/token.util";
import crypto from "crypto";
import { emailService } from "./email.service";
import { AppError } from "../utils/appError.util";
import { handlePrismaError } from "../utils/prismaErrorHandler.util";
import { emailVerificationTemplate } from "../templates/emailVerification.template";
import { Prisma } from "../../generated/prisma/client";
import { VerifyType } from "../types/verify.type";

export const verifyTokenService = {
  createVerifyToken: async (
    userId: string,
    fullName: string,
    email: string,
    verifyType?: VerifyType,
    tx?: Prisma.TransactionClient,
  ) => {
    try {
      // check if previous token still active
      const isTokenActive = await prisma.verification.findFirst({
        where: {
          userId,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (isTokenActive)
        throw new AppError(
          409,
          "Please wait for another 1 hour to send a new request",
        );

      // create email verification token
      const newToken = generateRawToken();
      const hashedToken = crypto
        .createHash("sha256")
        .update(newToken)
        .digest("hex");

      // send email verification
      try {
        await emailService.sendEmailWithToken(
          email,
          emailVerificationTemplate(fullName, newToken, verifyType),
        );
      } catch {
        throw new AppError(408, "Unable to send email verification");
      }

      if (tx) {
        await tx.verification.create({
          data: {
            userId: userId,
            hashedToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
          },
        });
      } else {
        await prisma.verification.create({
          data: {
            userId: userId,
            hashedToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
          },
        });
      }
    } catch (error) {
      handlePrismaError(error);
    }
  },
};
