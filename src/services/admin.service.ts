import { prisma } from "../configs/prisma.config";

export const adminServices = {
  getAllUsers: async (query: any) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const role = query.role;
    const skip = (page - 1) * limit;
    const allowedRoles = ["CUSTOMER", "STORE_ADMIN"]; // filter role yang diperbolehkan
    const where: any = {
      deletedAt: null,
    };
    if (role && allowedRoles.includes(role)) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
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
      }),

      prisma.user.count({
        where,
      }),
    ]);

    return {
      users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
};
