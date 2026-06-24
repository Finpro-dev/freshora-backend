import { StoreWhereInput } from "../../generated/prisma/models";
import { prisma } from "../configs/prisma.config";
import { CalculateNearestStore } from "../schemas/calculateNearestStore.schema";
import { CreateStoreInput } from "../schemas/createStore.schema";
import { EditStoreInput } from "../schemas/editStore.schema";
import { GetAllStore } from "../types/store.type";
import { AppError } from "../utils/appError.util";
import { uploadSingle } from "../utils/cloudinaryUploader.util";
import { handlePrismaError } from "../utils/prismaErrorHandler.util";
import haversine from "haversine-distance";

export const storeService = {
  createStore: async (data: CreateStoreInput, file: Express.Multer.File) => {
    try {
      let url = "";
      if (file) url = await uploadSingle(file, "freshora/store-avatars");

      const isPrimaryStoreInitialized = await prisma.store.findFirst({
        where: {
          storeStatus: "PRIMARY",
        },
      });

      const createdStore = await prisma.store.create({
        data: {
          ...data,
          districtId: Number(data.districtId),
          cityId: Number(data.cityId),
          provinceId: Number(data.provinceId),
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          avatar: url || null,
          userId: String(data.userId) || null,
          storeStatus: !isPrimaryStoreInitialized ? "PRIMARY" : "SECONDARY",
        },
      });

      return createdStore;
    } catch (error) {
      handlePrismaError(error);
    }
  },

  getNearestStore: async ({ lat, lng }: CalculateNearestStore) => {
    try {
      let storeId = "";
      if (!Number(lat) && !Number(lng)) {
        const primaryStore = await storeService.getPrimaryStore();
        storeId = primaryStore?.storeId as string;

        return storeId;
      }

      const stores = await prisma.store.findMany({
        where: {
          deletedAt: null,
          latitude: {
            not: null,
          },
          longitude: {
            not: null,
          },
        },
        select: {
          storeId: true,
          latitude: true,
          longitude: true,
        },
      });

      if (!stores?.length) {
        const primaryStore = await storeService.getPrimaryStore();
        storeId = primaryStore?.storeId as string;

        return storeId;
      }

      // loop
      const initStoreCoords = {
        latitude: stores?.[0].latitude as number,
        longitude: stores?.[0].longitude as number,
      };

      const userCoords = {
        latitude: lat as number,
        longitude: lng as number,
      };

      let minDistance = haversine(userCoords, initStoreCoords);

      stores?.forEach((store) => {
        const storeCoords = {
          latitude: store.latitude as number,
          longitude: store.longitude as number,
        };

        const distance = haversine(userCoords, storeCoords);

        if (distance < minDistance) {
          minDistance = distance;
          storeId = store.storeId;
        }
      });

      return storeId;
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
      include: {
        user: {
          select: {
            avatar: true,
            firstName: true,
            lastName: true,
          },
        },
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
      include: {
        user: {
          select: {
            userId: true,
            avatar: true,
            firstName: true,
            lastName: true,
            isVerified: true,
          },
        },
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
        userId,
      } = data;

      let url = "";

      if (file) {
        url = await uploadSingle(file, "freshora/user-avatars");
      }

      const updatedStore = await prisma.store.update({
        where: { storeId },
        data: {
          ...(address && { address }),
          ...(userId && { userId }),
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

  assignAdminStore: async (userId: string, storeId: string) => {
    try {
      const isHasAssigned = await prisma.store.findUnique({
        where: {
          userId,
        },
      });

      if (isHasAssigned)
        throw new AppError(409, "This user has been assigned to other store");

      const findUser = await prisma.user.findUnique({
        where: {
          userId,
        },
      });

      if (findUser?.role !== "STORE_ADMIN")
        throw new AppError(
          400,
          "Invalid user ID, user has to be a store admin",
        );

      await prisma.store.update({
        where: {
          storeId,
        },

        data: {
          userId,
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  },

  setPrimaryStore: async (storeId: string) => {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.store.updateMany({
          data: {
            storeStatus: "SECONDARY",
          },
        });

        await tx.store.update({
          where: {
            storeId,
          },
          data: {
            storeStatus: "PRIMARY",
          },
        });
      });
    } catch (error) {
      handlePrismaError(error);
    }
  },

  getPrimaryStore: async () => {
    const primaryStore = await prisma.store.findFirst({
      where: {
        storeStatus: "PRIMARY",
      },
    });

    return primaryStore;
  },
};
