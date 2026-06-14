import { prisma } from "../configs/prisma.config";
import { GetUsersQuery } from "../schemas/admin.schema";
import { SignupInput } from "../schemas/signup.schema";
import { userSelect } from "../statics/user.select";
import { AppError } from "../utils/appError.util";
import { createUniqueReferralCode } from "../utils/createUniqueReferralCode";
import { handlePrismaError } from "../utils/prismaErrorHandler.util";
import { generateFullName } from "../utils/userDataTransform.util";
import { verifyTokenService } from "./verifyToken.service";

export const adminServices = {
  getAllUsers: async (query: GetUsersQuery) => {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
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
        select: userSelect,
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

  getUserById: async (userId: string) => {
    try {
      const userDetails = await prisma.user.findFirst({
        where: {
          userId,
          deletedAt: null,
        },
        select: userSelect,
      });
      if (!userDetails) {
        throw new AppError(404, "User not found");
      }
      return userDetails;
    } catch (error) {
      handlePrismaError(error);
    }
  },

  createStoreAdmin: async (data: SignupInput) => {
    try {
      const { firstName, lastName, email, phone, gender } = data;

      const trimmedEmail = email.trim().toLowerCase();

      // check email in db
      const isExist = await prisma.user.findUnique({
        where: { email: trimmedEmail },
      });

      if (isExist && !isExist.password && !isExist.isVerified) {
        const fullname = generateFullName(
          isExist?.firstName,
          isExist?.lastName,
        );

        const userId = isExist.userId as string;
        await verifyTokenService.createVerifyToken(userId, fullname, email);
        throw new AppError(
          409,
          "Store Admin with this credential already registered, please check your email to verify",
        );
      }

      if (isExist && isExist.password && isExist.isVerified)
        throw new AppError(409, "User already registered, please login");

      const isPhoneNumberUsed = await prisma.user.findUnique({
        where: {
          phone,
        },
      });

      if (isPhoneNumberUsed)
        throw new AppError(409, "Phone number is already used");
      const newStoreAdmin = await prisma.$transaction(async (tx) => {
        const myReferralCode = await createUniqueReferralCode(tx);

        return await tx.user.create({
          data: {
            firstName,
            lastName,
            email: trimmedEmail,
            phone,
            gender,
            role: "STORE_ADMIN",
            myReferralCode,
            authProvider: "CREDENTIALS",
          },
        });
      });

      await verifyTokenService.createVerifyToken(
        newStoreAdmin.userId,
        generateFullName(newStoreAdmin.firstName, newStoreAdmin.lastName),
        trimmedEmail,
        "VERIFY_PASSWORD",
      );

      return newStoreAdmin;
    } catch (error) {
      handlePrismaError(error);
    }
  },

  verifyRequest: async (email: string) => {
    // find user
    const isValidUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!isValidUser) throw new AppError(400, "User is not found");

    if (isValidUser.isVerified && isValidUser.password !== null)
      throw new AppError(400, "Your account has been verified, please login");

    // find if there's an active link
    const isPrevLinkActive = await prisma.verification.findFirst({
      where: {
        userId: isValidUser.userId,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (isPrevLinkActive)
      throw new AppError(
        403,
        "Your previous link is still active, check your email",
      );

    // create email verification token
    const userId = isValidUser.userId;
    const fullName = generateFullName(
      isValidUser.firstName,
      isValidUser.lastName,
    );

    await verifyTokenService.createVerifyToken(userId, fullName, email);
  },

  updateStoreAdmin: async (adminId: string, data: Partial<SignupInput>) => {},

  deleteStoreAdmin: async (adminId: string) => {
    try {
      const storeAdmin = await prisma.user.findUnique({
        where: {
          userId: adminId,
        },
      });

      if (
        !storeAdmin ||
        storeAdmin.deletedAt !== null ||
        storeAdmin.role !== "STORE_ADMIN"
      ) {
        throw new AppError(404, "Store admin not found");
      }

      const deletedStoreAdmin = await prisma.user.update({
        where: {
          userId: adminId,
        },
        data: {
          deletedAt: new Date(),
        },
      });

      return deletedStoreAdmin;
    } catch (error) {
      throw handlePrismaError(error);
    }
  },
};
