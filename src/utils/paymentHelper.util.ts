import {
  PaymentStatus,
  PaymentType,
  Prisma,
  TransactionStatus,
} from "../../generated/prisma/client";
import { AppError } from "./appErrror.util";

// Maps Midtrans transaction_status to internal transaction and payment status.
export const mapMidtransStatus = (status: string) => {
  const STATUS_MAPPING = {
    capture: { transactionStatus: "PROCESSING", paymentStatus: "SETTLEMENT" },
    settlement: { transactionStatus: "PROCESSING", paymentStatus: "SETTLEMENT" },
    deny: { transactionStatus: "CANCELED", paymentStatus: "DENIED" },
    expire: { transactionStatus: "CANCELED", paymentStatus: "EXPIRED" },
    cancel: { transactionStatus: "CANCELED", paymentStatus: "CANCELLED" },
    refund: { transactionStatus: "CANCELED", paymentStatus: "REFUNDED" },
  } as const;

  const mapped =
    STATUS_MAPPING[status.toLowerCase() as keyof typeof STATUS_MAPPING];
  return (
    mapped || {
      transactionStatus: "WAITING_FOR_PAYMENT",
      paymentStatus: "PENDING",
    }
  );
};

// Restores stock to the fulfillment store and creates journal entries.
const rollbackOrderStock = async (
  transactionId: string,
  storeId: string,
  tx: Prisma.TransactionClient,
): Promise<void> => {
  const items = await tx.orderItem.findMany({
    where: { transactionId },
  });

  for (const item of items) {
    const stock = await tx.stock.findUnique({
      where: { storeId_productId: { storeId, productId: item.productId } },
    });

    if (stock) {
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

// Releases a free-shipping voucher when payment fails.
const rollbackFreeShippingVoucher = async (
  transactionId: string,
  tx: Prisma.TransactionClient,
): Promise<void> => {
  await tx.freeShippingVoucher.updateMany({
    where: { transactionId },
    data: { transactionId: null },
  });
};

// Releases a referral voucher when payment fails.
const rollbackReferralVoucher = async (
  transactionId: string,
  tx: Prisma.TransactionClient,
): Promise<void> => {
  await tx.referralVoucher.updateMany({
    where: { transactionId },
    data: { transactionId: null },
  });
};

// Updates transaction and payment status.
export const updateOrderPaymentStatus = async (
  transactionId: string,
  transactionStatus: TransactionStatus,
  paymentStatus: PaymentStatus,
  paymentType: PaymentType,
  tx: Prisma.TransactionClient,
): Promise<void> => {
  const current = await tx.transaction.findUnique({
    where: { transactionId },
  });

  // Allowed transitions
  const ALLOWED_TRANSITIONS: Record<string, TransactionStatus[]> = {
    WAITING_FOR_PAYMENT: ["PROCESSING", "CANCELED"],
    PROCESSING: ["SHIPPING", "CANCELED"],
    SHIPPING: ["COMPLETED", "CANCELED"],
  };

  const allowed =
    ALLOWED_TRANSITIONS[current?.transactionStatus as string] || [];
  if (!allowed.includes(transactionStatus)) {
    throw new AppError(
      405,
      `Invalid status transition from ${current?.transactionStatus} to ${transactionStatus}`,
    );
  }

  await tx.transaction.update({
    where: { transactionId },
    data: {
      transactionStatus,
      ...(transactionStatus === "PROCESSING" && { processedAt: new Date() }),
      ...(transactionStatus === "CANCELED" && { cancelledAt: new Date() }),
      ...(transactionStatus === "COMPLETED" && { completedAt: new Date() }),
      ...(transactionStatus === "SHIPPING" && { shippedAt: new Date() }),
    },
  });

  await tx.payment.update({
    where: { transactionId },
    data: {
      paymentStatus,
      paymentType: paymentType.toUpperCase() as PaymentType,
    },
  });
};

// Restores stock and releases vouchers when payment fails.
export const rollbackOrder = async (
  transactionId: string,
  storeId: string,
  tx: Prisma.TransactionClient,
): Promise<void> => {
  await rollbackOrderStock(transactionId, storeId, tx);
  await rollbackFreeShippingVoucher(transactionId, tx);
  await rollbackReferralVoucher(transactionId, tx);
};