import { prisma } from "../configs/prisma.config";
import { AppError } from "../utils/appErrror.util";
import { formatUserResponse } from "../utils/formatUserResponse";

export const userService = {
  getProfile: async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { userId },
    });

    if (!user) throw new AppError(404, "Invalid userId, user is not found");

    return formatUserResponse(user);
  },
};
