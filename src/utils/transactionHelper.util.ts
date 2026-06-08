import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../configs/prisma.config";
import { TDiscount } from "../types/transaction.type";
import { AppError } from "./appError.util";
import { haversineDistance } from "./distance.util";

const getStoresWithCoordinates = (tx: any) =>
  tx.store.findMany({
    where: { latitude: { not: null }, longitude: { not: null } },
  });

const findClosestStore = (stores: any[], lat: number, lon: number): string => {
  let closest = stores[0];
  let minDist = haversineDistance(
    lat,
    lon,
    closest.latitude!,
    closest.longitude!,
  );
  for (const store of stores.slice(1)) {
    const dist = haversineDistance(lat, lon, store.latitude!, store.longitude!);
    if (dist < minDist) {
      minDist = dist;
      closest = store;
    }
  }
  return closest.storeId;
};

export const findNearestStore = async (
  latitude: number,
  longitude: number,
  tx?: any,
): Promise<string> => {
  const client = tx || prisma;
  const stores = await getStoresWithCoordinates(client);
  if (stores.length === 0)
    throw new AppError(400, "No stores with valid coordinates available");
  return findClosestStore(stores, latitude, longitude);
};

// Cart computation helpers
// Calculate subtotal from cart items
export const calculateSubtotal = (cartItems: any[]): number =>
  cartItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

// Calculate total weight in grams
export const calculateTotalWeight = (cartItems: any[]): number =>
  cartItems.reduce(
    (sum, item) => sum + Number(item.product.weightPerGram) * item.quantity,
    0,
  );

// Generate unique invoice number
export const generateInvoiceNumber = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `TSX-${timestamp}-${random}`;
};

// Location info helpers
export const getStoreLocationInfo = async (
  storeId: string,
  tx?: Prisma.TransactionClient,
): Promise<{ cityId: number; city: string }> => {
  const client = tx || prisma;
  const store = await client.store.findUnique({
    where: { storeId },
    select: { cityId: true, city: true },
  });
  if (!store) throw new AppError(404, "Store not found");
  if (!store.cityId) throw new AppError(400, "Store location data incomplete");
  return { cityId: store.cityId, city: store.city };
};

export const getAddressLocationInfo = async (
  addressId: string,
  tx?: Prisma.TransactionClient,
): Promise<{ cityId: number; city: string }> => {
  const client = tx || prisma;
  const address = await client.address.findUnique({
    where: { addressId },
    select: { cityId: true, city: true },
  });
  if (!address) throw new AppError(404, "Address not found");
  return { cityId: address.cityId, city: address.city };
};

// Stock validation helpers
// Pre-check: validates total stock across ALL stores
export const validateTotalStock = async (cartItems: any[]): Promise<void> => {
  for (const item of cartItems) {
    const stocks = await prisma.stock.findMany({
      where: { productId: item.productId },
    });
    const totalStock = stocks.reduce((sum, s) => sum + s.quantity, 0);
    if (totalStock < item.quantity) {
      throw new AppError(
        400,
        `Insufficient total stock for: ${item.product.name}`,
      );
    }
  }
};

// Voucher validation helpers
const isReferralVoucherValid = (v: any, now: Date): boolean =>
  !!v && now >= v.validFrom && now <= v.validUntil && !v.transactionId;

// Validates free-shipping voucher belongs to user and is unused.
export const validateFreeShippingVoucher = async (
  freeShippingVoucherId: string,
  userId: string,
  tx?: Prisma.TransactionClient,
): Promise<void> => {
  const client = tx || prisma;
  const voucher = await client.freeShippingVoucher.findUnique({
    where: { freeShippingVoucherId },
  });

  if (!voucher || voucher.userId !== userId)
    throw new AppError(400, "Invalid free shipping voucher");

  if (voucher.transactionId)
    throw new AppError(400, "Free shipping voucher already used");
};

// Validates and applies a referral voucher, adding its discount to the discount object.
export const validateVoucher = async (
  referralVoucherId: string,
  userId: string,
  grandTotal: number,
  discount: TDiscount,
  tx?: Prisma.TransactionClient,
): Promise<void> => {
  const client = tx || prisma;
  const voucher = await client.referralVoucher.findUnique({
    where: { referralVoucherId },
  });

  if (!voucher || voucher.userId !== userId)
    throw new AppError(400, "Invalid or expired voucher code");

  const now = new Date();
  if (!isReferralVoucherValid(voucher, now))
    throw new AppError(400, "Voucher expired or already used");

  discount.referralVoucherDiscount =
    grandTotal * (Number(voucher.discountAmount) / 100);
};

// Discount calculation helpers
export const calculateProductDiscount = (
  cartItems: any[],
  discount: TDiscount,
): void => {
  for (const item of cartItems) {
    if (!item.product?.discounts?.length) continue;

    const bogoDiscount = item.product.discounts.find(
      (d: any) =>
        d.type === "BUY_ONE_GET_ONE" && new Date(d.validUntil) > new Date(),
    );

    if (bogoDiscount?.type === "BUY_ONE_GET_ONE") {
      const paidQty = item.quantity;
      const freeQty = item.quantity;
      item.quantity = paidQty + freeQty;
      item.discountAmount = Number(item.product.price) * freeQty;
      item.subtotal = Number(item.product.price) * paidQty; // only charge paid items
      continue;
    }

    const noReqDiscount = item.product.discounts.find(
      (d: any) =>
        d.type === "NO_REQUIREMENT" && new Date(d.validUntil) > new Date(),
    );

    if (noReqDiscount?.type === "NO_REQUIREMENT") {
      const subTotal = Number(item.product.price) * item.quantity;
      const totalDiscount =
        (subTotal * Number(noReqDiscount.discountAmount)) / 100;
      discount.productItemDiscountAmmount += totalDiscount;
      item.discountAmount = totalDiscount;
      item.subtotal = subTotal - totalDiscount;
    }
  }
};
