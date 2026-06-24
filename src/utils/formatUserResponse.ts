import { User } from "../../generated/prisma/browser";
import { prisma } from "../configs/prisma.config";

export const formatUserResponse = async (user: User) => {
  let storeId: string | null = null;

  // Ambil storeId jika user adalah STORE_ADMIN
  if (user.role === "STORE_ADMIN") {
    const store = await prisma.store.findUnique({
      where: { userId: user.userId },
      select: { storeId: true },
    });
    storeId = store?.storeId || null;
  }
  return {
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    gender: user.gender,
    role: user.role,
    isVerified: user.isVerified,
    avatar: user.avatar,
    myReferralCode: user.myReferralCode,
    usedReferralCode: user.usedReferralCode,
    createdAt: user.createdAt,
    storeId,
  };
};
