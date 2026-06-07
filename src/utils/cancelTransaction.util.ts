import { Prisma } from "../../generated/prisma/client";
import { createStockJournal } from "./stockJournal.util";

// Restores stock, releases vouchers, updates status.
export const cancelTransaction = async (
  transactionId: string,
  storeId: string,
  tx: Prisma.TransactionClient,
): Promise<void> => {
  // Fetch all order items for this transaction
  const orderItems = await tx.orderItem.findMany({
    where: { transactionId },
  });

  // Fetch all stock records 
  const productIds = orderItems.map((item) => item.productId);
  const stocks = await tx.stock.findMany({
    where: { storeId, productId: { in: productIds } },
  });
  const stockMap = new Map(stocks.map((s) => [s.productId, s]));

  // Restore stock and create journal for each item
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

  // Release vouchers
  await tx.freeShippingVoucher.updateMany({
    where: { transactionId },
    data: { transactionId: null },
  });

  await tx.referralVoucher.updateMany({
    where: { transactionId },
    data: { transactionId: null },
  });

  // Update transaction status
  await tx.transaction.update({
    where: { transactionId },
    data: { transactionStatus: "CANCELED", cancelledAt: new Date() },
  });

  // Update payment status
  await tx.payment.update({
    where: { transactionId },
    data: { paymentStatus: "CANCELLED" },
  });
};