import { prisma } from "../configs/prisma.config";
import { AppError } from "../utils/appError.util";
import { handlePrismaError } from "../utils/prismaErrorHandler.util";

export const stockService = {
  findAllStocks: async (params: {
    storeId?: string;
    page: number;
    limit: number;
    search: string;
  }) => {
    const { storeId, page, limit, search } = params;

    try {
      const whereClause: any = {};

      if (storeId) {
        whereClause.storeId = storeId;
      }

      if (search) {
        whereClause.product = {
          name: {
            contains: search,
            mode: "insensitive",
          },
        };
      }

      const total = await prisma.stock.count({
        where: whereClause,
      });

      const stocks = await prisma.stock.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          product: {
            select: {
              productId: true,
              name: true,
              serialNumber: true,
              productPhotos: {
                select: {
                  photoUrl: true,
                },
              },
            },
          },
          store: {
            select: { name: true },
          },
        },
      });

      return {
        data: stocks,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      handlePrismaError(error);
      throw error;
    }
  },

  findStockById: async (stockId: string) => {
    try {
      const stock = await prisma.stock.findUnique({
        where: { stockId },
        include: {
          product: {
            select: { productId: true, name: true, serialNumber: true },
          },
        },
      });
      return stock;
    } catch (error) {
      handlePrismaError(error);
    }
  },

  findAllJournals: async (storeId?: string) => {
    try {
      const journals = await prisma.stockJournal.findMany({
        where: storeId ? { stock: { storeId } } : {},
        include: {
          user: {
            select: { firstName: true, lastName: true },
          },
          stock: {
            include: {
              product: {
                select: { productId: true, name: true, serialNumber: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return journals;
    } catch (error) {
      handlePrismaError(error);
    }
  },

  processStockAdjustment: async (payload: {
    productId: string;
    storeId: string;
    quantityChange: number;
    type: "MANUAL_ADD" | "MANUAL_DEDUCT";
    userId: string;
  }) => {
    const { productId, storeId, quantityChange, type, userId } = payload;

    try {
      const result = await prisma.$transaction(async (tx) => {
        let stock = await tx.stock.findFirst({
          where: { productId, storeId },
        });

        if (!stock) {
          if (type === "MANUAL_DEDUCT") {
            throw new AppError(
              400,
              "Product stock is not registered in this store, deduction is not allowed.",
            );
          }
          stock = await tx.stock.create({
            data: { productId, storeId, quantity: 0 },
          });
        }

        if (
          type === "MANUAL_DEDUCT" &&
          stock.quantity < Math.abs(quantityChange)
        ) {
          throw new AppError(
            400,
            `Insufficient stock available for deduction. Current stock: ${stock.quantity}`,
          );
        }

        const finalQuantityChange =
          type === "MANUAL_DEDUCT"
            ? -Math.abs(quantityChange)
            : Math.abs(quantityChange);

        const journal = await tx.stockJournal.create({
          data: {
            stockId: stock.stockId,
            quantityChange: finalQuantityChange,
            type,
            updatedBy: userId,
          },
        });

        const updatedStock = await tx.stock.update({
          where: { stockId: stock.stockId },
          data: {
            quantity: {
              increment: finalQuantityChange,
            },
          },
        });

        return { updatedStock, journal };
      });

      return result;
    } catch (error) {
      handlePrismaError(error);
    }
  },
};
