import { Prisma } from "../../generated/prisma/client";
import { createStockJournal } from "./stockJournal.util";

import { PaymentStatus } from "../../generated/prisma/client";

// Restores stock, releases vouchers, updates status.
export const cancelTransaction = async (
  transactionId: string,
  storeId: string,
  tx: Prisma.TransactionClient,
  paymentStatus: PaymentStatus = "CANCELLED",
): Promise<void> => {
  // only succeeds if status is still WAITING_FOR_PAYMENT.
  const updated = await tx.transaction.updateMany({
    where: { transactionId, transactionStatus: "WAITING_FOR_PAYMENT" },
    data: { transactionStatus: "CANCELED", cancelledAt: new Date() },
  });
  if (updated.count === 0) return;

  const orderItems = await tx.orderItem.findMany({ where: { transactionId } });
  const productIds = orderItems.map((item) => item.productId);

  const stocks = await tx.stock.findMany({
    where: { storeId, productId: { in: productIds } },
  });
  const stockMap = new Map(stocks.map((s) => [s.productId, s]));

  // Restore stock + journal in parallel
  await Promise.all(
    orderItems.map((item) => {
      const stock = stockMap.get(item.productId);
      if (!stock) return Promise.resolve();
      return tx.stock
        .update({
          where: { stockId: stock.stockId },
          data: { quantity: { increment: item.quantity } },
        })
        .then(() =>
          createStockJournal(stock.stockId, item.quantity, "ORDER_CANCELED", tx, transactionId)
        );
    })
  );

  // Release vouchers
  await tx.freeShippingVoucher.updateMany({
    where: { transactionId },
    data: { transactionId: null },
  });
  await tx.referralVoucher.updateMany({
    where: { transactionId },
    data: { transactionId: null },
  });

  // Update payment status
  await tx.payment.update({
    where: { transactionId },
    data: { paymentStatus },
  });
};