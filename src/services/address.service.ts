import { prisma } from "../configs/prisma.config";
import { CreateAddressInput } from "../schemas/createAddress.schema";
import { EditAddressInput } from "../schemas/editAddressSchema";
import { MAX_ADDRESS_PER_USER } from "../statics/address.static";
import { AppError } from "../utils/appError.util";
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

  getAllUserAddresses: async (userId: string) => {
    return await prisma.address.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  getAddressDetails: async (userId: string, addressId: string) => {
    return await prisma.address.findUnique({
      where: {
        userId,
        addressId,
      },
    });
  },

  editAddressDetails: async (
    userId: string,
    addressId: string,
    data: EditAddressInput,
  ) => {
    const {
      address,
      addressStatus,
      city,
      cityId,
      districtId,
      provinceId,
      district,
      postalCode,
      province,
      latitude,
      longitude,
    } = data;
    try {
      const editedAddress = await prisma.$transaction(async (tx) => {
        // update status only
        if (addressStatus === "PRIMARY") {
          await tx.address.updateMany({
            where: {
              userId,
            },

            data: {
              addressStatus: "SECONDARY",
            },
          });

          return await tx.address.update({
            where: {
              userId,
              addressId,
            },

            data: {
              addressStatus: "PRIMARY",
            },
          });
        }

        return await tx.address.update({
          where: {
            userId,
            addressId,
          },

          data: {
            ...(address && { address }),
            ...(city && { city }),
            ...(district && { district }),
            ...(province && { province }),
            ...(districtId && { districtId }),
            ...(cityId && { cityId }),
            ...(provinceId && { provinceId }),
            ...(postalCode && { postalCode }),
            ...(latitude && { latitude }),
            ...(longitude && { longitude }),
          },
        });
      });

      return editedAddress;
    } catch (error) {
      handlePrismaError(error);
    }
  },

  deleteUserAddress: async (userId: string, addressId: string) => {
    try {
      await prisma.$transaction(async (tx) => {
        const selectedAddress = await tx.address.findUnique({
          where: {
            userId,
            addressId,
          },
        });

        if (selectedAddress?.addressStatus === "PRIMARY")
          throw new AppError(
            403,
            "You are not allowed to delete primary address",
          );

        await tx.address.update({
          where: {
            userId,
            addressId,
          },

          data: {
            deletedAt: new Date(),
          },
        });
      });
    } catch (error) {
      handlePrismaError(error);
    }
  },
};
