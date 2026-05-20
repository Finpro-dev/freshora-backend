import { User } from "../../generated/prisma/browser";

export const formatUserResponse = (data: User, add?: any) => {
  return {
    userId: data.userId,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    gender: data.gender,
    role: data.role,
    isVerified: data.isVerified,
    avatar: data.avatar,
    myReferralCode: data.myReferralCode,
    usedReferralCpde: data.usedReferralCode,
    createdAt: data.createdAt,
    ...add,
  };
};
