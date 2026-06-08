import { prisma } from "../configs/prisma.config";
import { handlePrismaError } from "../utils/prismaErrorHandler.util";

export const refreshTokenService = {
  removeRefreshToken: async () => {
    try {
      const expiredRefreshTokens = await prisma.refreshToken.findMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      if (expiredRefreshTokens?.length === 0) return 0;

      await prisma.refreshToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });

      return expiredRefreshTokens?.length;
    } catch (error) {
      handlePrismaError(error);
    }
  },
};
