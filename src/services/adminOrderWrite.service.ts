import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../configs/prisma.config";
import { AppError } from "../utils/appError.util";
import { handlePrismaError } from "../utils/prismaErrorHandler.util";
import { validateAdminStatusTransition } from "../utils/adminOrder.util";
import { restoreStockOnAdminCancel, releaseVouchersOnCancel, updatePaymentOnCancel } from "../utils/adminOrderData.util";

export const updateOrderToShipping = async (
  transactionId: string,
  role: string,
  storeId: string | null
) => {
  try {
    const where: Prisma.TransactionWhereInput = { transactionId, deletedAt: null };
    if (role === "STORE_ADMIN" && storeId) where.storeId = storeId;

    const order = await prisma.transaction.findFirst({ where, include: { store: { select: { storeId: true } } } });
    if (!order) throw new AppError(404, "Order not found");

    validateAdminStatusTransition(order.transactionStatus, "SHIPPING");

    await prisma.transaction.update({
      where: { transactionId },
      data: { transactionStatus: "SHIPPING", shippedAt: new Date() },
    });

    return { message: "Order status updated to SHIPPING" };
  } catch (error) {
    handlePrismaError(error);
  }
};

export const cancelOrder = async (transactionId: string, role: string, storeId: string | null) => {
  try {
    const where: Prisma.TransactionWhereInput = { transactionId, deletedAt: null };
    if (role === "STORE_ADMIN" && storeId) where.storeId = storeId;

    await prisma.$transaction(async (tx) => {
      const existingOrder = await tx.transaction.findFirst({ where });
      if (!existingOrder) throw new AppError(404, "Order not found");

      if (!["WAITING_FOR_PAYMENT", "PROCESSING", "SHIPPING"].includes(existingOrder.transactionStatus)) {
        throw new AppError(400, "Order cannot be canceled at this stage");
      }

      const updated = await tx.transaction.updateMany({
        where: { transactionId, transactionStatus: { in: ["WAITING_FOR_PAYMENT", "PROCESSING", "SHIPPING"] } },
        data: { transactionStatus: "CANCELED", cancelledAt: new Date() },
      });

      if (updated.count === 0) throw new AppError(409, "Order status was modified by another process");

      await restoreStockOnAdminCancel(transactionId, existingOrder.storeId, tx);
      await releaseVouchersOnCancel(transactionId, tx);
      await updatePaymentOnCancel(transactionId, tx);
    });

    return { message: "Order canceled successfully" };
  } catch (error) {
    handlePrismaError(error);
  }
};