import { prisma } from "../configs/prisma.config";
import { handlePrismaError } from "../utils/prismaErrorHandler.util";
import { SalesReportInput, StockReportInput, StockDetailReportInput } from "../schemas/report.schema";

export const reportService = {
  getMonthlySalesReport: async (storeId: string | null, input: SalesReportInput) => {
    try {
      const { year, month } = input;

      const startDate = month && month > 0
        ? new Date(Date.UTC(year, month - 1, 1))
        : new Date(Date.UTC(year, 0, 1));
      const endDate = month && month > 0
        ? new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))
        : new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

      const where: any = {
        deletedAt: null,
        createdAt: { gte: startDate, lte: endDate },
      };

      if (storeId) {
        where.storeId = storeId;
      }

      const transactions = await prisma.transaction.findMany({
        where,
        include: {
          orderItems: {
            include: {
              product: {
                include: {
                  productCategory: true,
                },
              },
            },
          },
          store: { select: { storeId: true, name: true } },
        },
      });

      const monthlyTotal = transactions.reduce((sum, t) => sum + Number(t.grandTotal), 0);

      const months = month
        ? [month]
        : Array.from({ length: 12 }, (_, i) => i + 1);

      const monthlyData = months.map((m) => {
        const monthTransactions = transactions.filter(t => {
          const transMonth = t.createdAt.getUTCMonth() + 1;
          return transMonth === m;
        });

        const total = monthTransactions.reduce((sum, t) => sum + Number(t.grandTotal), 0);
        const orderCount = monthTransactions.length;

        return {
          month: m,
          monthName: new Date(Date.UTC(year, m - 1, 1)).toLocaleString("default", { month: "short" }),
          totalSales: total,
          orderCount,
        };
      });

      return {
        year,
        month: month || null,
        totalSales: monthlyTotal,
        months: monthlyData,
      };
    } catch (error) {
      handlePrismaError(error);
    }
  },

  getMonthlySalesByCategory: async (storeId: string | null, input: SalesReportInput) => {
    try {
      const { year, month } = input;

      const startDate = month && month > 0
        ? new Date(Date.UTC(year, month - 1, 1))
        : new Date(Date.UTC(year, 0, 1));
      const endDate = month && month > 0
        ? new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))
        : new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

      const where: any = {
        deletedAt: null,
        createdAt: { gte: startDate, lte: endDate },
      };

      if (storeId) {
        where.storeId = storeId;
      }

      const transactions = await prisma.transaction.findMany({
        where,
        include: {
          orderItems: {
            include: {
              product: {
                include: {
                  productCategory: true,
                },
              },
            },
          },
        },
      });

      const categoryMap: Record<string, { categoryId: string; categoryName: string; totalSales: number; quantity: number }> = {};

      transactions.forEach(transaction => {
        transaction.orderItems.forEach(item => {
          const categoryName = item.product.productCategory.category;
          const categoryId = item.product.productCategory.productCategoryId;
          const itemTotal = Number(item.subTotalItem);

          if (!categoryMap[categoryId]) {
            categoryMap[categoryId] = {
              categoryId,
              categoryName,
              totalSales: 0,
              quantity: 0,
            };
          }

          categoryMap[categoryId].totalSales += itemTotal;
          categoryMap[categoryId].quantity += item.quantity;
        });
      });

      return Object.values(categoryMap).sort((a, b) => b.totalSales - a.totalSales);
    } catch (error) {
      handlePrismaError(error);
    }
  },

  getMonthlySalesByProduct: async (storeId: string | null, input: SalesReportInput) => {
    try {
      const { year, month } = input;

      const startDate = month && month > 0
        ? new Date(Date.UTC(year, month - 1, 1))
        : new Date(Date.UTC(year, 0, 1));
      const endDate = month && month > 0
        ? new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))
        : new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

      const where: any = {
        deletedAt: null,
        createdAt: { gte: startDate, lte: endDate },
      };

      if (storeId) {
        where.storeId = storeId;
      }

      const transactions = await prisma.transaction.findMany({
        where,
        include: {
          orderItems: {
            include: {
              product: {
                include: {
                  productCategory: true,
                  stocks: storeId ? { where: { storeId } } : true,
                },
              },
            },
          },
        },
      });

      const productMap: Record<string, { productId: string; productName: string; categoryName: string; totalSales: number; quantity: number }> = {};

      transactions.forEach(transaction => {
        transaction.orderItems.forEach(item => {
          const productId = item.product.productId;
          const itemTotal = Number(item.subTotalItem);

          if (!productMap[productId]) {
            productMap[productId] = {
              productId,
              productName: item.product.name,
              categoryName: item.product.productCategory.category,
              totalSales: 0,
              quantity: 0,
            };
          }

          productMap[productId].totalSales += itemTotal;
          productMap[productId].quantity += item.quantity;
        });
      });

      return Object.values(productMap).sort((a, b) => b.totalSales - a.totalSales);
    } catch (error) {
      handlePrismaError(error);
    }
  },

  getMonthlyStockSummary: async (storeId: string | null, input: StockReportInput) => {
    try {
      const { year, month } = input;

      const startDate = month && month > 0
        ? new Date(Date.UTC(year, month - 1, 1))
        : new Date(Date.UTC(year, 0, 1));
      const endDate = month && month > 0
        ? new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))
        : new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

      const where: any = {
        deletedAt: null,
        createdAt: { gte: startDate, lte: endDate },
      };

      if (storeId) {
        where.stock = { storeId };
      }

      const stockJournals = await prisma.stockJournal.findMany({
        where,
        include: {
          stock: {
            include: {
              product: true,
              store: true,
            },
          },
          user: { select: { firstName: true, lastName: true } },
          mutation: true,
          transaction: true,
        },
      });

      const productMap: Record<string, {
        productId: string;
        productName: string;
        storeId: string;
        storeName: string;
        totalAddition: number;
        totalDeduction: number;
        finalStock: number;
      }> = {};

      for (const journal of stockJournals) {
        const productId = journal.stock.productId;
        const store = journal.stock.store;
        const storeIdKey = store.storeId;

        const key = `${productId}-${storeIdKey}`;

        if (!productMap[key]) {
          const currentStock = await prisma.stock.findUnique({
            where: { storeId_productId: { storeId: store.storeId, productId } },
            select: { quantity: true },
          });

          productMap[key] = {
            productId,
            productName: journal.stock.product.name,
            storeId: storeIdKey,
            storeName: store.name,
            totalAddition: 0,
            totalDeduction: 0,
            finalStock: currentStock?.quantity || 0,
          };
        }

        if (journal.quantityChange > 0) {
          productMap[key].totalAddition += journal.quantityChange;
        } else {
          productMap[key].totalDeduction += Math.abs(journal.quantityChange);
        }
      }

      return Object.values(productMap);
    } catch (error) {
      handlePrismaError(error);
    }
  },

  getStockDetailReport: async (storeId: string | null, input: StockDetailReportInput) => {
    try {
      const { year, month, productId, page = 1, limit = 20 } = input;
      const skip = (page - 1) * limit;

      const startDate = month && month > 0
        ? new Date(Date.UTC(year, month - 1, 1))
        : new Date(Date.UTC(year, 0, 1));
      const endDate = month && month > 0
        ? new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))
        : new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

      const where: any = {
        deletedAt: null,
        createdAt: { gte: startDate, lte: endDate },
      };

      if (storeId) {
        where.stock = { storeId };
      }

      if (productId) {
        where.stock = { ...where.stock, productId };
      }

      const [journals, total] = await Promise.all([
        prisma.stockJournal.findMany({
          where,
          skip,
          take: limit,
          include: {
            stock: {
              include: {
                product: true,
                store: true,
              },
            },
            user: { select: { firstName: true, lastName: true } },
            mutation: true,
            transaction: true,
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.stockJournal.count({ where }),
      ]);

      const formattedJournals = journals.map(journal => ({
        stockJournalId: journal.stockJournalId,
        productId: journal.stock.productId,
        productName: journal.stock.product.name,
        storeId: journal.stock.storeId,
        storeName: journal.stock.store.name,
        quantityChange: journal.quantityChange,
        type: journal.type,
        updatedBy: journal.user ? `${journal.user.firstName} ${journal.user.lastName}` : null,
        mutationId: journal.mutationId,
        transactionId: journal.transactionId,
        createdAt: journal.createdAt,
      }));

      const totalPages = Math.ceil(total / limit);

      return {
        journals: formattedJournals,
        pagination: { page, limit, total, totalPages, hasNextPage: page < totalPages },
      };
    } catch (error) {
      handlePrismaError(error);
    }
  },
};