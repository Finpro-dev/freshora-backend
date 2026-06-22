import { Prisma } from "../../generated/prisma/client";
import { snap } from "../configs/midtrans.config";
import { createStockJournal } from "./stockJournal.util";
import { decrementStock } from "./stock.util";
import { applyFreeShippingVoucher, applyReferralVoucher, buildOrderItems } from "./transactionOrder.util";
import { generateInvoiceNumber } from "./transactionHelper.util";

// Executes order creation in atomic transaction.
export const executeCreateOrder = async (
  cart: any,
  userId: string,
  addressId: string,
  storeId: string,
  subtotal: number,
  shippingCost: number,
  totalDiscount: number,
  grandTotal: number,
  user: any,
  tx: Prisma.TransactionClient,
  freeShippingVoucherId?: string,
  referralVoucherId?: string,
) => {
  // Create transaction record
  const transaction = await tx.transaction.create({
    data: {
      transactionNumber: generateInvoiceNumber(),
      userId,
      addressId,
      storeId,
      totalAmount: new Prisma.Decimal(subtotal),
      shippingCost: new Prisma.Decimal(shippingCost),
      totalDiscount: new Prisma.Decimal(totalDiscount),
      grandTotal: new Prisma.Decimal(grandTotal),
      transactionStatus: "WAITING_FOR_PAYMENT",
      orderItems: { create: buildOrderItems(cart.cartItems) },
    },
  });

  // Create Midtrans snap transaction and payment
  const snapResponse = await snap.createTransaction({
    transaction_details: {
      order_id: transaction.transactionNumber,
      gross_amount: Math.floor(grandTotal),
    },
    customer_details: {
      first_name: `${user.firstName} ${user.lastName}`,
      email: user.email,
    },
    credit_card: { secure: true },
  } as any);

  await tx.payment.create({
    data: {
      transactionId: transaction.transactionId,
      snapToken: snapResponse.token,
      paymentType: "QRIS",
      paymentStatus: "PENDING",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  // Fetch all stock records upfront (single query)
  const productIds = cart.cartItems.map((item: any) => item.productId);
  const stocks = await tx.stock.findMany({
    where: { storeId, productId: { in: productIds } },
  });
  const stockMap = new Map(stocks.map((s) => [s.productId, s]));

  // Decrement stock and create journal for each item
  for (const item of cart.cartItems) {
    await decrementStock(storeId, item.productId, item.quantity, transaction.transactionId, tx);
    const stock = stockMap.get(item.productId);
    if (stock) {
      await createStockJournal(stock.stockId, -item.quantity, "ORDER_REDUCTION", tx, transaction.transactionId);
    }
  }

  // Mark vouchers as used
  if (freeShippingVoucherId) await applyFreeShippingVoucher(freeShippingVoucherId, transaction.transactionId, tx);
  if (referralVoucherId) await applyReferralVoucher(referralVoucherId, transaction.transactionId, tx);

  // Clear cart
  await tx.cartItem.deleteMany({ where: { cartId: cart.cartId } });
  await tx.cart.delete({ where: { cartId: cart.cartId } });

  return { transactionId: transaction.transactionId, snapToken: snapResponse.token };
};