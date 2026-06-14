import { Prisma } from "../../generated/prisma/client";
import { createStockJournal } from "./stockJournal.util";

// Restores stock when admin cancels order and creates journal entries
export const restoreStockOnAdminCancel = async (
  transactionId: string,
  storeId: string,
  tx: Prisma.TransactionClient
): Promise<void> => {
  const orderItems = await tx.orderItem.findMany({ where: { transactionId } });
  if (orderItems.length === 0) return;

  const stocks = await tx.stock.findMany({
    where: { storeId, productId: { in: orderItems.map((item) => item.productId) } },
  });
  const stockMap = new Map(stocks.map((s) => [s.productId, s]));

  for (const item of orderItems) {
    const stock = stockMap.get(item.productId);
    if (stock) {
      await tx.stock.update({
        where: { stockId: stock.stockId },
        data: { quantity: { increment: item.quantity } },
      });
      await createStockJournal(stock.stockId, item.quantity, "ORDER_CANCELED", tx, transactionId);
    }
  }
};

// Releases vouchers when admin cancels order
export const releaseVouchersOnCancel = async (
  transactionId: string,
  tx: Prisma.TransactionClient
): Promise<void> => {
  await tx.freeShippingVoucher.updateMany({
    where: { transactionId },
    data: { transactionId: null },
  });
  await tx.referralVoucher.updateMany({
    where: { transactionId },
    data: { transactionId: null },
  });
};

// Updates payment status to cancelled
export const updatePaymentOnCancel = async (
  transactionId: string,
  tx: Prisma.TransactionClient
): Promise<void> => {
  await tx.payment.update({
    where: { transactionId },
    data: { paymentStatus: "CANCELLED" },
  });
};