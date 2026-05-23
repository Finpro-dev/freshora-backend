import { handlePrismaError } from "../utils/prismaErrorHandler.util";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "../configs/prisma.config";
import { AppError } from "../utils/appErrror.util";
import { HASH_SALT } from "../statics/token.static";
import { ResetPasswordInput } from "../schemas/resetPassword.schema";
import { generateRawToken } from "../utils/token.util";
import { emailService } from "./email.service";
import { resetPasswordTemplate } from "../templates/emailResetPassword.template";

export const passwordService = {
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

  resetPassword: async ({ email }: ResetPasswordInput) => {
    try {
      // find user
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      // if there's no user found
      if (!user) throw new AppError(400, "Invalid user credential");

      // editable for credetials user only
      if (user?.authProvider !== "CREDENTIALS")
        throw new AppError(403, "You are not allowed to modify password");

      // if the user has not been authenticated
      if (!user.password && !user.isVerified)
        throw new AppError(401, "Please verify your email to create password");

      // check if the prev token is still active
      const isTokenActive = await prisma.resetPassword.findFirst({
        where: {
          userId: user.userId,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (isTokenActive)
        throw new AppError(
          409,
          "Please wait 15 minutes before requesting another link.",
        );

      // create email verification token
      const newToken = generateRawToken();
      const hashedToken = crypto
        .createHash("sha256")
        .update(newToken)
        .digest("hex");

      // send email verification
      try {
        const fullName = `${user.firstName} ${user.lastName}`;
        await emailService.sendEmailWithToken(
          email,
          resetPasswordTemplate(fullName, newToken),
        );
      } catch {
        throw new AppError(408, "Unable to send email verification");
      }

      // insert resetPassword data to DB
      await prisma.resetPassword.create({
        data: {
          userId: user.userId,
          hashedToken,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  },

  setNewPassword: async (password: string, token: string) => {
    try {
      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      // search token
      const isValidToken = await prisma.resetPassword.findFirst({
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
          "Link has expired, request new reset password link",
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
        await tx.resetPassword.deleteMany({
          where: {
            userId: isValidToken.userId,
          },
        });
      });
    } catch (error) {
      handlePrismaError(error);
    }
  },
};
