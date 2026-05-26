import { StoreWhereInput } from "../../generated/prisma/models";
import { prisma } from "../configs/prisma.config";
import { CreateStoreInput } from "../schemas/createStore.schema";
import { EditStoreInput } from "../schemas/editStore.schema";
import { GetAllStore } from "../types/store.type";
import { AppError } from "../utils/appErrror.util";
import { uploadSingle } from "../utils/cloudinaryUploader.util";
import { handlePrismaError } from "../utils/prismaErrorHandler.util";

export const storeService = {
  createStore: async (data: CreateStoreInput, file: Express.Multer.File) => {
    try {
      let url = "";
      if (file) url = await uploadSingle(file, "freshora/store-avatars");

      const createdStore = await prisma.store.create({
        data: {
          ...data,
          districtId: Number(data.districtId),
          cityId: Number(data.cityId),
          provinceId: Number(data.provinceId),
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          avatar: url || null,
          userId: null,
        },
      });

      return createdStore;
    } catch (error) {
      handlePrismaError(error);
    }
  },

  getAllStore: async ({ page, limit, search }: GetAllStore) => {
    const offset = (page - 1) * limit;

    const where: StoreWhereInput = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          city: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          province: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          district: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const stores = await prisma.store.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalData = await prisma.store.count({
      where,
    });

    const totalPage = Math.ceil(totalData / limit);

    return {
      totalData,
      totalPage,
      stores,
    };
  },

  getStoreDetails: async (storeId: string) => {
    const storeDetails = await prisma.store.findUnique({
      where: {
        storeId,
      },
    });

    if (!storeDetails)
      throw new AppError(404, "Invalid storeId, store is not found");

    return storeDetails;
  },

  deleteStore: async (storeId: string) => {
    try {
      await prisma.store.update({
        where: { storeId },
        data: {
          deletedAt: new Date(),
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  },

  editStore: async (
    storeId: string,
    file: Express.Multer.File,
    data: EditStoreInput,
  ) => {
    try {
      const {
        address,
        city,
        cityId,
        district,
        districtId,
        latitude,
        longitude,
        name,
        phone,
        postalCode,
        province,
        provinceId,
      } = data;

      let url = "";

      if (file) {
        url = await uploadSingle(file, "freshora/user-avatars");
      }

      const updatedStore = await prisma.store.update({
        where: { storeId },
        data: {
          ...(address && { address }),
          ...(city && { city }),
          ...(cityId && { cityId: Number(cityId) }),
          ...(district && { district }),
          ...(districtId && { districtId: Number(districtId) }),
          ...(province && { province }),
          ...(provinceId && { provinceId: Number(provinceId) }),
          ...(latitude && { latitude: Number(latitude) }),
          ...(longitude && { longitude: Number(longitude) }),
          ...(name && { name }),
          ...(phone && { phone }),
          ...(postalCode && { postalCode }),
          ...(file && { avatar: url }),
        },
      });

      return updatedStore;
    } catch (error) {
      handlePrismaError(error);
    }
  },
};
