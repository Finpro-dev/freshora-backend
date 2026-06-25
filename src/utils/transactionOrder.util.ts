import { Prisma } from "../../generated/prisma/client";
import { rajaOngkirCouriers } from "../statics/courir.static";
import { AppError } from "./appError.util";
import { rajaOngkirService } from "../services/rajaOngkir.service";

// Builds OrderItem records from cart items after discounts have been applied.
export const buildOrderItems = (cartItems: any[]) =>
  cartItems.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: new Prisma.Decimal(item.product.price),
    discountAmount: new Prisma.Decimal(item.discountAmount || 0),
    subTotalItem: new Prisma.Decimal(
      item.subtotal ?? Number(item.product.price) * item.quantity,
    ),
  }));

// Tries each courier sequentially until one returns a shipping cost.
export const calculateShipping = async (
  originCityId: number,
  destCityId: number,
  weight: number,
  courier: string,
): Promise<number> => {
  const cost = await rajaOngkirService.calculateShippingCost({
    origin: originCityId,
    destination: destCityId,
    weight,
    courier,
  });

  if (cost) {
    return cost;
  } else {
    throw new AppError(400, "Failed to calculate shipping cost");
  }
};

// Marks a free-shipping voucher as used.
export const applyFreeShippingVoucher = async (
  voucherId: string,
  transactionId: string,
  tx: Prisma.TransactionClient,
) => {
  await tx.freeShippingVoucher.update({
    where: { freeShippingVoucherId: voucherId },
    data: { transactionId },
  });
};

// Marks a referral voucher as used.
export const applyReferralVoucher = async (
  voucherId: string,
  transactionId: string,
  tx: Prisma.TransactionClient,
) => {
  await tx.referralVoucher.update({
    where: { referralVoucherId: voucherId },
    data: { transactionId },
  });
};
