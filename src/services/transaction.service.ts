import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../configs/prisma.config";
import {
  CreateTransactionInput,
  GetOrderListInput,
} from "../schemas/createTransaction.schema";
import { TDiscount } from "../types/transaction.type";
import { AppError } from "../utils/appError.util";
import { handlePrismaError } from "../utils/prismaErrorHandler.util";
import {
  calculateProductDiscount,
  calculateSubtotal,
  calculateTotalWeight,
  getAddressLocationInfo,
  getStoreLocationInfo,
  validateFreeShippingVoucher,
  validateTotalStock,
  validateVoucher,
} from "../utils/transactionHelper.util";
import { calculateShipping } from "../utils/transactionOrder.util";
import { executeCreateOrder } from "../utils/createTransaction.util";
import { cancelTransaction } from "../utils/cancelTransaction.util";

export const transactionService = {
  createOrder: async (userId: string, data: CreateTransactionInput) => {
    try {
      // Fetch cart with items and product discount data
      const cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          cartItems: {
            include: { product: { include: { discounts: true } } },
          },
        },
      });

      if (!cart?.cartItems.length) throw new AppError(400, "Cart is empty");

      const { storeId } = cart;

      // Verify address belongs to this user
      const address = await prisma.address.findFirst({
        where: { addressId: data.addressId, userId, deletedAt: null },
      });
      if (!address) throw new AppError(404, "Address not found");

      // total stock across all stores
      await validateTotalStock(cart.cartItems);

      // Fetch user info for Midtrans customer_details
      const user = await prisma.user.findUnique({
        where: { userId },
        select: { firstName: true, lastName: true, email: true },
      });
      if (!user) throw new AppError(404, "User not found");

      // Compute cart totals
      const subtotal = calculateSubtotal(cart.cartItems);
      const weight = calculateTotalWeight(cart.cartItems);

      // Resolve location IDs for shipping cost
      const originInfo = await getStoreLocationInfo(storeId);
      const destInfo = await getAddressLocationInfo(data.addressId);

      // Discount accumulator
      const discount: TDiscount = {
        productItemDiscountAmmount: 0,
        referralVoucherDiscount: 0,
      };

      // Apply discounts
      calculateProductDiscount(cart.cartItems, discount);

      // Calculate shipping cost
      let shippingCost = 0;
      if (!data.freeShippingVoucherId) {
        shippingCost = await calculateShipping(originInfo.cityId, destInfo.cityId, weight);
      } else {
        // Validate free-shipping voucher ownership and usage
        await validateFreeShippingVoucher(data.freeShippingVoucherId, userId);
      }

      // Apply referral voucher
      let grandTotal = subtotal - discount.productItemDiscountAmmount + shippingCost;
      if (data.referralVoucherId) {
        await validateVoucher(data.referralVoucherId, userId, grandTotal, discount);
        grandTotal -= discount.referralVoucherDiscount;
      }

      const totalDiscount = discount.productItemDiscountAmmount + discount.referralVoucherDiscount;

      // Execute atomic transaction
      return await prisma.$transaction(async (tx) => {
        return executeCreateOrder(
          cart,
          userId,
          data.addressId,
          storeId,
          subtotal,
          shippingCost,
          totalDiscount,
          grandTotal,
          user,
          tx,
          data.freeShippingVoucherId,
          data.referralVoucherId,
        );
      });
    } catch (error) {
      handlePrismaError(error);
    }
  },

  cancelOrder: async (userId: string, transactionId: string) => {
    try {
      // Verify transaction exists and belongs to user
      const transaction = await prisma.transaction.findFirst({
        where: { transactionId, userId, deletedAt: null },
      });

      if (!transaction) throw new AppError(404, "Transaction not found");

      // only cancel before payment is made
      if (transaction.transactionStatus !== "WAITING_FOR_PAYMENT") {
        throw new AppError(400, "Order cannot be canceled after payment has been made");
      }

      // Execute cancel in atomic transaction
      await prisma.$transaction(async (tx) => {
        await cancelTransaction(transactionId, transaction.storeId, tx);
      });

      return { message: "Order canceled successfully" };
    } catch (error) {
      handlePrismaError(error);
    }
  },

  confirmOrder: async (userId: string, transactionId: string) => {
    try {
      // Verify transaction exists and belongs to user
      const transaction = await prisma.transaction.findFirst({
        where: { transactionId, userId, deletedAt: null },
      });

      if (!transaction) throw new AppError(404, "Transaction not found");

      // User can only confirm after order is shipped
      if (transaction.transactionStatus !== "SHIPPING") {
        throw new AppError(400, "Order cannot be confirmed before it is shipped");
      }

      // Update transaction status to completed
      await prisma.transaction.update({
        where: { transactionId },
        data: {
          transactionStatus: "COMPLETED",
          completedAt: new Date(),
        },
      });

      return { message: "Order confirmed successfully" };
    } catch (error) {
      handlePrismaError(error);
    }
  },

  getOrderList: async (userId: string, params: GetOrderListInput) => {
    try {
      const { search, status, startDate, endDate, sortBy, sortOrder, page = 1, limit = 10 } = params;

      const skip = (page - 1) * limit;

      const where: Prisma.TransactionWhereInput = {
        userId,
        deletedAt: null,
      };

      // Filter by transaction status
      if (status) where.transactionStatus = status;

      // Filter by date
      if (startDate) {
        const start = new Date(startDate);
        if (!isNaN(start.getTime())) where.createdAt = { gte: start };
      }

      if (endDate) {
        const end = new Date(endDate);
        if (!isNaN(end.getTime())) {
          where.createdAt = { ...(where.createdAt as object), lte: end };
        }
      }

      // Search by transaction number
      if (search) {
        where.transactionNumber = { contains: search, mode: "insensitive" };
      }

      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            store: { select: { name: true } },
            orderItems: {
              include: {
                product: {
                  select: {
                    name: true,
                    productPhotos: { take: 1, select: { photoUrl: true } },
                  },
                },
              },
            },
          },
        }),
        prisma.transaction.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        transactions,
        pagination: { page, limit, total, totalPages, hasNextPage: page < totalPages },
      };
    } catch (error) {
      handlePrismaError(error);
    }
  },
};