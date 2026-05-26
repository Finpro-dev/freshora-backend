import { prisma } from "../configs/prisma.config";

export const adminServices = {
  getAllUsers: async () => {
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        gender: true,
        role: true,
        isVerified: true,
        avatar: true,
        myReferralCode: true,
        usedReferralCode: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return users;
  },
};
