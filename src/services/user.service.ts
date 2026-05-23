import { prisma } from "../configs/prisma.config";
import { UpdateUserProfileInput } from "../schemas/updateUserProfile.schema";
import { AppError } from "../utils/appErrror.util";
import { uploadSingle } from "../utils/cloudinaryUploader.util";
import { formatUserResponse } from "../utils/formatUserResponse";
import { handlePrismaError } from "../utils/prismaErrorHandler.util";
import { generateFullName } from "../utils/userDataTransform.util";
import { verifyTokenService } from "./verifyToken.service";

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
        url = await uploadSingle(avatar, "user-avatar");
      }

      const updatedUserProfile = await prisma.$transaction(async (tx) => {
        if (email) {
          await verifyTokenService.createVerifyToken(
            userId,
            fullName,
            email,
            tx,
          );
        }

        await tx.user.update({
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
      });
    } catch (error) {
      handlePrismaError(error);
    }
  },
};
