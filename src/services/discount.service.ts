import { handlePrismaError } from "../utils/prismaErrorHandler.util";
import { prisma } from "../configs/prisma.config";
import {
  CreateDiscountInput,
  GetDiscountInput,
} from "../schemas/discount.schema";
import { Prisma } from "../../generated/prisma/client";
import { AppError } from "../utils/appError.util";

interface AdminContext {
  userId: string;
  role: string;
}

export const discountServices = {
  getDiscount: async (params: GetDiscountInput, admin: AdminContext) => {
    const { page = 1, limit = 10, type, status } = params;
    const skip = (page - 1) * limit;
    const currentDate = new Date();

    const where: Prisma.DiscountWhereInput = {
      deletedAt: null,
    };

    // Isolation Data Toko untuk STORE_ADMIN
    if (admin.role === "STORE_ADMIN") {
      const adminStore = await prisma.store.findUnique({
        where: { userId: admin.userId },
      });
      if (!adminStore) {
        throw new AppError(404, "Store not found for this admin");
      }
      where.storeId = adminStore.storeId;
    }

    if (type) where.type = type;

    if (status === "ACTIVE") {
      where.validFrom = { lte: currentDate };
      where.validUntil = { gte: currentDate };
    } else if (status === "EXPIRED") {
      where.validUntil = { lt: currentDate };
    } else if (status === "UPCOMING") {
      where.validFrom = { gt: currentDate };
    }

    const [discounts, totalData] = await prisma.$transaction([
      prisma.discount.findMany({
        where,
        skip,
        take: limit,
        // Gunakan include product secara aman karena sekarang bisa bernilai null
        include: { product: true, store: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.discount.count({ where }),
    ]);

    return {
      meta: {
        page,
        limit,
        totalData,
        totalPages: Math.ceil(totalData / limit),
      },
      data: discounts,
    };
  },

  createDiscount: async (data: CreateDiscountInput, admin: AdminContext) => {
    try {
      const {
        productId, // 🆕 Sekarang bersifat opsional (String?)
        type,
        valueType,
        discountAmount,
        minTransaction,
        maxDiscount,
        validFrom,
        validUntil,
      } = data;

      // 1. Cek eksistensi produk HANYA JIKA productId disediakan
      if (productId) {
        const productExist = await prisma.product.findUnique({
          where: { productId, deletedAt: null },
        });
        if (!productExist) throw new AppError(404, "Product not found");
      }

      // 2. 🛡️ VALIDASI ATURAN BISNIS (Sesuai Ketentuan Assignment)

      // Batasan Nilai Persentase
      if (
        valueType === "PERCENTAGE" &&
        (Number(discountAmount) <= 0 || Number(discountAmount) > 100)
      ) {
        throw new AppError(
          400,
          "Percentage discount must be between 1% and 100%",
        );
      }

      // Aturan untuk Beli 1 Gratis 1 (BOGO)
      if (type === "BUY_ONE_GET_ONE") {
        if (!productId) {
          throw new AppError(
            400,
            "Buy One Get One discount must be applied to a specific product",
          );
        }
        if (valueType !== "PERCENTAGE" || Number(discountAmount) !== 100) {
          throw new AppError(
            400,
            "For BUY_ONE_GET_ONE, valueType must be PERCENTAGE and discountAmount must be 100%",
          );
        }
      }

      // Aturan untuk Minimal Transaksi (Voucher Belanja)
      if (type === "MIN_TRANSACTION") {
        if (!minTransaction || Number(minTransaction) <= 0) {
          throw new AppError(
            400,
            "Minimum transaction amount is required and must be greater than 0 for this discount type",
          );
        }
      }

      // Aturan untuk Diskon Tanpa Ketentuan (Direct Markdown Produk)
      if (type === "NO_REQUIREMENT") {
        if (!productId) {
          throw new AppError(
            400,
            "Direct markdown discount (NO_REQUIREMENT) must be applied to a specific product",
          );
        }
      }

      // 3. BYPASS STRATEGI: Cari targetStoreId via userId
      let targetStoreId: string | null = null;
      if (admin.role === "STORE_ADMIN") {
        const adminStore = await prisma.store.findUnique({
          where: { userId: admin.userId },
        });
        if (!adminStore) {
          throw new AppError(404, "Store not found for this admin");
        }
        targetStoreId = adminStore.storeId;

        // Validasi ketersediaan stok HANYA JIKA diskonnya spesifik ke produk tertentu
        if (productId) {
          const hasStock = await prisma.stock.findUnique({
            where: { storeId_productId: { storeId: targetStoreId, productId } },
          });
          if (!hasStock) {
            throw new AppError(
              403,
              "You can only create discounts for products stocked in your store",
            );
          }
        }
      }

      // 4. Deteksi tabrakan waktu (overlap) diskon aktif
      const duplicateDiscount = await prisma.discount.findFirst({
        where: {
          // 💡 PENTING: Gunakan 'productId || null' agar Prisma mencari nilai NULL absolut
          // untuk diskon global, bukan mengabaikan filter (jika undefined)
          productId: productId || null,
          storeId: targetStoreId,
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
          productId
            ? "This product already has an active discount in this store within the specified time range"
            : "This store already has an active global transaction voucher within the specified time range",
        );
      }

      // 5. Simpan ke database
      return await prisma.discount.create({
        data: {
          productId: productId || null,
          storeId: targetStoreId,
          type,
          valueType,
          discountAmount: new Prisma.Decimal(discountAmount),
          minTransaction: minTransaction
            ? new Prisma.Decimal(minTransaction)
            : null,
          maxDiscount: maxDiscount ? new Prisma.Decimal(maxDiscount) : null,
          validFrom: new Date(validFrom),
          validUntil: new Date(validUntil),
        },
        include: {
          product: { select: { name: true, price: true } },
          store: { select: { name: true } },
        },
      });
    } catch (error) {
      handlePrismaError(error);
      throw error;
    }
  },

  deleteDiscount: async (id: string, admin: AdminContext) => {
    try {
      const discount = await prisma.discount.findFirst({
        where: { discountId: id, deletedAt: null },
      });
      if (!discount) throw new AppError(404, "Discount not found");

      // Validasi hak kepemilikan toko sebelum penghapusan data
      if (admin.role === "STORE_ADMIN") {
        const adminStore = await prisma.store.findUnique({
          where: { userId: admin.userId },
        });
        if (!adminStore || discount.storeId !== adminStore.storeId) {
          throw new AppError(
            403,
            "You are not authorized to delete this store's discount",
          );
        }
      }

      await prisma.discount.update({
        where: { discountId: id },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      handlePrismaError(error);
      throw error;
    }
  },
};
