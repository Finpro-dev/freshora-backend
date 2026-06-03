import { prisma } from "../configs/prisma.config";
import { AppError } from "../utils/appErrror.util";
import { handlePrismaError } from "../utils/prismaErrorHandler.util";

export const categoryServices = {
  getProductCategories: async () => {
    const categories = await prisma.productCategory.findMany({
      where: {
        deletedAt: null,
      },
    });
    return categories;
  },

  createProductCategory: async (data: { category: string }) => {
    try {
      const existingCategory = await prisma.productCategory.findFirst({
        where: {
          category: data.category,
          deletedAt: null,
        },
      });

      if (existingCategory) {
        throw new AppError(409, "Category already exists");
      }
      await prisma.productCategory.create({
        data: {
          category: data.category,
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  },

  updateProductCategories: async (id: string, data: { category: string }) => {
    try {
      const productCategory = await prisma.productCategory.findFirst({
        where: {
          productCategoryId: id,
          deletedAt: null,
        },
      });
      if (!productCategory) {
        throw new AppError(404, "Category not found");
      }
      await prisma.productCategory.update({
        where: {
          productCategoryId: id,
        },
        data: {
          category: data.category,
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  },

  deleteProductCategories: async (id: string) => {
    try {
      const productCategory = await prisma.productCategory.findFirst({
        where: {
          productCategoryId: id,
          deletedAt: null,
        },
      });
      if (!productCategory) {
        throw new AppError(404, "Category not found");
      }
      await prisma.productCategory.update({
        where: {
          productCategoryId: id,
        },
        data: {
          deletedAt: new Date(),
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  },
};
