import { prisma } from "../configs/prisma.config";
import { CreateStoreInput } from "../schemas/createStore.schema";
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
};
