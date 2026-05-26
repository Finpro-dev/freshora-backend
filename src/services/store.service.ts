import { StoreWhereInput } from "../../generated/prisma/models";
import { prisma } from "../configs/prisma.config";
import { CreateStoreInput } from "../schemas/createStore.schema";
import { GetAllStore } from "../types/store.type";
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
};
