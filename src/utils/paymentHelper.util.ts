const STATUS_MAPPING = {
  capture: { transactionStatus: "PROCESSING", paymentStatus: "SETTLEMENT" },
  settlement: { transactionStatus: "PROCESSING", paymentStatus: "SETTLEMENT" },
  deny: { transactionStatus: "CANCELED", paymentStatus: "DENIED" },
  expire: { transactionStatus: "CANCELED", paymentStatus: "EXPIRED" },
  cancel: { transactionStatus: "CANCELED", paymentStatus: "CANCELLED" },
  refund: { transactionStatus: "CANCELED", paymentStatus: "REFUND" },
} as const;

// Map Midtrans status to internal status
export const mapMidtransStatus = (status: string) => {
  const mapped = STATUS_MAPPING[status.toLowerCase() as keyof typeof STATUS_MAPPING];
  return mapped || { transactionStatus: "WAITING_FOR_PAYMENT", paymentStatus: "PENDING" };
};

// Rollback stock when payment fails
const rollbackOrderStock = async (
  transactionId: string,
  tx: any,
): Promise<void> => {
  const items = await tx.orderItem.findMany({
    where: { transactionId },
  });

  for (const item of items) {
    const stocks = await tx.stock.findMany({
      where: { productId: item.productId },
    });

    for (const stock of stocks) {
      await tx.stock.update({
        where: { stockId: stock.stockId },
        data: { quantity: { increment: item.quantity } },
      });

      await tx.stockJournal.create({
        data: {
          stockId: stock.stockId,
          quantityChange: item.quantity,
          type: "ORDER_CANCELED",
          transactionId,
        },
      });
    }
  }
};

// Update transaction and payment status
export const updateOrderPaymentStatus = async (
  transactionId: string,
  transactionStatus: string,
  paymentStatus: string,
  tx: any,
): Promise<void> => {
  // Get current transaction state
  const current = await tx.transaction.findUnique({
    where: { transactionId },
  });

  // Allow update if:
  const isAllowedTransition =
    current.transactionStatus === "WAITING_FOR_PAYMENT" ||
    (current.transactionStatus === "PROCESSING" && transactionStatus === "CANCELED");

  if (!isAllowedTransition) {
    return;
  }

  await tx.transaction.update({
    where: { transactionId },
    data: { transactionStatus },
  });

  await tx.payment.update({
    where: { transactionId },
    data: { paymentStatus },
  });
};

// Rollback payment stock
export const rollbackPaymentStock = async (
  transactionId: string,
  tx: any,
): Promise<void> => {
  await rollbackOrderStock(transactionId, tx);
};
