import { prisma } from "../configs/prisma.config";
import { CreateAddressInput } from "../schemas/createAddress.schema";
import { MAX_ADDRESS_PER_USER } from "../statics/address.static";
import { AppError } from "../utils/appErrror.util";
import { handlePrismaError } from "../utils/prismaErrorHandler.util";

export const addressService = {
  createAddress: async (userId: string, data: CreateAddressInput) => {
    try {
      const newAddress = await prisma.$transaction(async (tx) => {
        const countUserAddresses = await tx.address.count({
          where: {
            userId,
          },
        });

        if (countUserAddresses === MAX_ADDRESS_PER_USER)
          throw new AppError(
            403,
            "You have reached max address data (3 addresses)",
          );

        return await tx.address.create({
          data: {
            userId,
            ...data,
            addressStatus: !countUserAddresses ? "PRIMARY" : "SECONDARY",
          },
        });
      });

      return newAddress;
    } catch (error) {
      handlePrismaError(error);
    }
  },
};
