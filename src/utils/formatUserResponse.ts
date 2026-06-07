import { User } from "../../generated/prisma/browser";

export const formatUserResponse = (user: User) => {
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
  };
};
