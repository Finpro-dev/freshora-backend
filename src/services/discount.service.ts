import { handlePrismaError } from "../utils/prismaErrorHandler.util";
import { prisma } from "../configs/prisma.config";
import {
  CreateDiscountInput,
  GetDiscountInput,
} from "../schemas/discount.schema";
import { Prisma } from "../../generated/prisma/client";
import { AppError } from "../utils/appError.util";

export const discountServices = {
  getDiscount: async (params: GetDiscountInput) => {
    const { page = 1, limit = 10, type, status } = params;
    const skip = (page - 1) * limit;
    const currentDate = new Date();
    const where: Prisma.DiscountWhereInput = {
      deletedAt: null,
    };

    if (type) {
      where.type = type;
    }
    if (status === "ACTIVE") {
      where.validFrom = {
        lte: currentDate,
      };
      where.validUntil = {
        gte: currentDate, // validUntil >= waktu sekarang
      };
    } else if (status === "EXPIRED") {
      where.validUntil = {
        lt: currentDate, // validUntil < waktu sekarang
      };
    }

    // Implementation for fetching discounts would go here
    const [discounts, totalData] = await prisma.$transaction([
      prisma.discount.findMany({
        where,
        skip,
        take: limit,
        include: {
          product: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.discount.count({
        where,
      }),
    ]);

    const totalPages = Math.ceil(totalData / limit);

    return {
      meta: {
        page,
        limit,
        totalData,
        totalPages,
      },
      data: discounts,
    };
  },

  createDiscount: async (data: CreateDiscountInput) => {
    try {
      const {
        productId,
        type,
        discountAmount,
        minTransaction,
        validFrom,
        validUntil,
      } = data;
      const productExist = await prisma.product.findUnique({
        where: { productId, deletedAt: null },
      });

      if (!productExist) {
        throw new AppError(404, "Product not found or has been deleted");
      }
      const duplicateDiscount = await prisma.discount.findFirst({
        where: {
          productId,
          deletedAt: null,
          OR: [
            {
              validFrom: { lte: new Date(validUntil) },
              validUntil: { gte: new Date(validFrom) },
            },
          ],
        },
      });

      if (duplicateDiscount) {
        throw new AppError(
          409,
          "This product already has an active discount within the specified time range",
        );
      }
      const newDiscount = await prisma.discount.create({
        data: {
          productId,
          type,
          discountAmount: new Prisma.Decimal(discountAmount), // Konversi ke tipe Decimal Prisma
          minTransaction: minTransaction
            ? new Prisma.Decimal(minTransaction)
            : null,
          validFrom: new Date(validFrom),
          validUntil: new Date(validUntil),
        },
        include: {
          product: {
            select: {
              name: true,
              price: true,
            },
          },
        },
      });

      return newDiscount;
    } catch (error) {
      handlePrismaError(error);
    }
  },

  deleteDiscount: async (id: string) => {
    try {
      const discount = await prisma.discount.findFirst({
        where: {
          discountId: id,
          deletedAt: null,
        },
      });

      if (!discount) {
        throw new AppError(404, "Discount not found or has been deleted");
      }

      await prisma.discount.update({
        where: {
          discountId: id,
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
