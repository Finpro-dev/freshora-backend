import { prisma } from "../configs/prisma.config";
import { generateRawToken } from "../utils/token.util";
import crypto from "crypto";
import { emailService } from "./email.service";
import { AppError } from "../utils/appErrror.util";
import { handlePrismaError } from "../utils/prismaErrorHandler.util";
import { emailVerificationTemplate } from "../templates/emailVerification.template";
import { Prisma } from "../../generated/prisma/client";

export const verifyTokenService = {
  createVerifyToken: async (
    userId: string,
    fullName: string,
    email: string,
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
          "Your previous email verification link is still active, please check your email",
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
          emailVerificationTemplate(fullName, newToken),
        );
      } catch {
        throw new AppError(408, "Unable to send email verification");
      }

      if (tx) {
        await tx.verification.create({
          data: {
            userId: userId,
            hashedToken,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          },
        });
      } else {
        await prisma.verification.create({
          data: {
            userId: userId,
            hashedToken,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          },
        });
      }
    } catch (error) {
      handlePrismaError(error);
    }
  },
};
