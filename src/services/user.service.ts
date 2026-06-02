import { UserWhereInput } from "../../generated/prisma/models";
import { prisma } from "../configs/prisma.config";
import { UpdateUserProfileInput } from "../schemas/updateUserProfile.schema";
import { AppError } from "../utils/appErrror.util";
import { uploadSingle } from "../utils/cloudinaryUploader.util";
import { formatUserResponse } from "../utils/formatUserResponse";
import { handlePrismaError } from "../utils/prismaErrorHandler.util";
import { generateFullName } from "../utils/userDataTransform.util";
import { verifyTokenService } from "./verifyToken.service";
import crypto from "crypto";

export const userService = {
  getProfile: async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { userId },
    });

    if (!user) throw new AppError(404, "Invalid userId, user is not found");

    return formatUserResponse(user);
  },

  updateProfile: async (
    userId: string,
    avatar: Express.Multer.File,
    data: UpdateUserProfileInput,
  ) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          userId,
        },
      });

      const { firstName, lastName, email, phone, gender } = data;
      const fullName = generateFullName(
        firstName || user?.firstName,
        lastName || user?.lastName,
      );

      let url = "";
      if (avatar) {
        url = await uploadSingle(avatar, "freshora/user-avatars");
      }

      const updatedUserProfile = await prisma.$transaction(
        async (tx) => {
          if (email) {
            await verifyTokenService.createVerifyToken(
              userId,
              fullName,
              email,
              "VERIFY_ONLY",
              tx,
            );
          }

          const updatedUser = await tx.user.update({
            where: {
              userId,
            },

            data: {
              ...(firstName && { firstName }),
              ...(lastName && { lastName }),
              ...(email && { email, isVerified: false }),
              ...(phone && { phone }),
              ...(gender && { gender }),
              ...(avatar && { avatar: url }),
            },
          });

          return updatedUser;
        },
        {
          maxWait: 5000,
          timeout: 20000,
        },
      );

      return formatUserResponse(updatedUserProfile);
    } catch (error) {
      handlePrismaError(error);
    }
  },

  verifyEmail: async (token: string) => {
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
          410,
          "Link has expired, request new verification link",
        );

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: {
            userId: isValidToken.userId,
          },

          data: {
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

  getAllUnassignedAdmin: async (
    page: number,
    limit: number,
    search: string,
  ) => {
    const offset = (page - 1) * limit;
    const where: UserWhereInput = {
      role: "STORE_ADMIN",
      store: null,
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ];
    }
    const storeAdmins = await prisma.user.findMany({
      where,
      take: limit,
      skip: offset,
    });

    const totalData = await prisma.user.count({
      where,
    });

    const totalPage = Math.ceil(totalData / limit);

    return { totalData, totalPage, storeAdmin: storeAdmins };
  },
};
