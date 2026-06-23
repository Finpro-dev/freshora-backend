import { prisma } from "../configs/prisma.config";
import { AppError } from "../utils/appError.util";
import { handlePrismaError } from "../utils/prismaErrorHandler.util";

export const stockService = {
  // 1. GET ALL STOCKS
  findAllStocks: async (storeId?: string) => {
    try {
      const stocks = await prisma.stock.findMany({
        where: storeId ? { storeId } : {},
        include: {
          product: {
            select: { productId: true, name: true, serialNumber: true },
          },
          store: {
            select: { name: true },
          },
        },
      });
      return stocks;
    } catch (error) {
      handlePrismaError(error);
    }
  },

  // 2. GET SINGLE STOCK BY ID
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

  // 3. GET JOURNALS / LOG HISTORY
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

  // 4. PROCESS MUTATION STOCK (INTEGRATED WITH TRANSACTION & APP_ERROR)
  processStockAdjustment: async (payload: {
    productId: string;
    storeId: string;
    quantityChange: number;
    type: "MANUAL_ADD" | "MANUAL_DEDUCT";
    userId: string;
  }) => {
    const { productId, storeId, quantityChange, type, userId } = payload;

    try {
      // Jalankan database transaction secara aman
      const result = await prisma.$transaction(async (tx) => {
        // A. Cari data baris stok di toko tersebut
        let stock = await tx.stock.findFirst({
          where: { productId, storeId },
        });

        // B. Fitur Auto-Create jika belum terdaftar di toko
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

        // C. Validasi logika agar stok tidak minus
        if (
          type === "MANUAL_DEDUCT" &&
          stock.quantity < Math.abs(quantityChange)
        ) {
          throw new AppError(
            400,
            `Insufficient stock available for deduction. Current stock: ${stock.quantity}`,
          );
        }

        // Memastikan nilai quantityChange disimpan minus (-) jika tipenya pengurangan
        const finalQuantityChange =
          type === "MANUAL_DEDUCT"
            ? -Math.abs(quantityChange)
            : Math.abs(quantityChange);

        // D. Buat history di Jurnal tanpa field 'reason'
        const journal = await tx.stockJournal.create({
          data: {
            stockId: stock.stockId,
            quantityChange: finalQuantityChange,
            type,
            updatedBy: userId,
          },
        });

        // E. Update angka stok fisik berdasarkan jurnal
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
