import { checkAndCreateMutationIfNeeded } from "./consolidatedShipmentHelper.util";
import { haversineDistance } from "./distance.util";

const STATUS_MAPPING = {
  capture: { transactionStatus: "PROCESSING", paymentStatus: "SETTLEMENT" },
  settlement: { transactionStatus: "PROCESSING", paymentStatus: "SETTLEMENT" },
  deny: { transactionStatus: "CANCELED", paymentStatus: "DENIED" },
  expire: { transactionStatus: "CANCELED", paymentStatus: "EXPIRED" },
  cancel: { transactionStatus: "CANCELED", paymentStatus: "CANCELLED" },
} as const;

// Map Midtrans status to internal status
const mapMidtransStatusToInternal = (status: string) => {
  const mapped = STATUS_MAPPING[status.toLowerCase() as keyof typeof STATUS_MAPPING];
  return mapped || { transactionStatus: "WAITING_FOR_PAYMENT", paymentStatus: "PENDING" };
};

// Record stock deduction and create journal entry
const recordStockDeduction = async (
  stock: any,
  deduct: number,
  transactionId: string,
  tx: any,
): Promise<void> => {
  await tx.stock.update({
    where: { stockId: stock.stockId },
    data: { quantity: { decrement: deduct } },
  });

  await tx.stockJournal.create({
    data: {
      stockId: stock.stockId,
      quantityChange: -deduct,
      type: "ORDER_REDUCTION",
      transactionId,
    },
  });
};

// Reduce item stock from nearest stores first (closest to customer)
const reduceItemStock = async (
  item: any,
  sortedStocks: any[],
  transactionId: string,
  tx: any,
): Promise<void> => {
  let remaining = item.quantity;
  for (const stock of sortedStocks) {
    if (remaining <= 0) break;
    const deduct = Math.min(remaining, stock.quantity);
    await recordStockDeduction(stock, deduct, transactionId, tx);
    remaining -= deduct;
  }
};

// Map Midtrans status
export const mapMidtransStatus = (status: string) => {
  return mapMidtransStatusToInternal(status);
};

// Process stock reduction for all order items
export const reduceOrderStock = async (
  transactionId: string,
  tx: any,
): Promise<void> => {
  // Get transaction with address coordinates
  const transaction = await tx.transaction.findUnique({
    where: { transactionId },
    include: { address: true },
  });

  if (!transaction?.address.latitude || !transaction?.address.longitude) {
    throw new Error("Address missing coordinates for stock reduction");
  }

  // Get all stores sorted by distance from customer
  const stores = await tx.store.findMany({
    include: {
      stocks: {
        where: { product: { deletedAt: null } },
      },
    },
  });

  const sortedStores = stores
    .filter((s: any) => s.latitude && s.longitude)
    .sort((a: any, b: any) => {
      const distA = haversineDistance(
        transaction.address.latitude!,
        transaction.address.longitude!,
        a.latitude!,
        a.longitude!,
      );
      const distB = haversineDistance(
        transaction.address.latitude!,
        transaction.address.longitude!,
        b.latitude!,
        b.longitude!,
      );
      return distA - distB;
    });

  const items = await tx.orderItem.findMany({
    where: { transactionId },
  });

  // Check if mutations needed before reducing stock
  for (const item of items) {
    const canFulfill = await checkAndCreateMutationIfNeeded(
      sortedStores,
      item,
      tx,
    );
    if (!canFulfill) {
      throw new Error(
        `Insufficient stock for product ${item.productId} across all stores`,
      );
    }
  }

  // Reduce stock from nearest store
  for (const item of items) {
    // Get stocks for this item sorted by store distance
    const stocks = await tx.stock.findMany({
      where: { productId: item.productId },
      include: { store: true },
    });

    const itemStocks = stocks
      .filter((s: any) => s.store.latitude && s.store.longitude)
      .sort((a: any, b: any) => {
        const distA = haversineDistance(
          transaction.address.latitude!,
          transaction.address.longitude!,
          a.store.latitude!,
          a.store.longitude!,
        );
        const distB = haversineDistance(
          transaction.address.latitude!,
          transaction.address.longitude!,
          b.store.latitude!,
          b.store.longitude!,
        );
        return distA - distB;
      });

    await reduceItemStock(item, itemStocks, transactionId, tx);
  }

  await tx.transaction.update({
    where: { transactionId },
    data: { processedAt: new Date() },
  });
};

// Update transaction and payment status
export const updateOrderPaymentStatus = async (
  transactionId: string,
  transactionStatus: string,
  paymentStatus: string,
  tx: any,
): Promise<void> => {
  await tx.transaction.update({
    where: { transactionId },
    data: { transactionStatus },
  });

  await tx.payment.update({
    where: { transactionId },
    data: { paymentStatus },
  });
};
