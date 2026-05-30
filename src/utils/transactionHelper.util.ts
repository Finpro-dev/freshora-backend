import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../configs/prisma.config";
import { TDiscount } from "../types/transaction.type";
import { AppError } from "./appErrror.util";
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

// Calculate subtotal from cart items
export const calculateSubtotal = (cartItems: any[]): number => {
  return cartItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );
};

// Calculate total weight in grams
export const calculateTotalWeight = (cartItems: any[]): number => {
  return cartItems.reduce((sum, item) => {
    const itemWeight = Number(item.product.weightPerGram) * item.quantity;
    return sum + itemWeight;
  }, 0);
};

// Generate unique invoice number
export const generateInvoiceNumber = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `TSX-${timestamp}-${random}`;
};

const findVoucherByCode = (referralVoucherId: string, tx: any) =>
  tx.referralVoucher.findUnique({
    where: { referralVoucherId },
  });

const isVoucherValid = (v: any, now: Date): boolean =>
  !!v && now >= v.validFrom && now <= v.validUntil && !v.transactionId;

// validate referral voucher
export const validateVoucher = async (
  referralVoucherId: string,
  userId: string,
  grandTotal: number,
  discount: TDiscount,
  tx?: Prisma.TransactionClient,
): Promise<void> => {
  const client = tx || prisma;
  const voucher = await findVoucherByCode(referralVoucherId, client);
  if (!voucher || voucher.userId !== userId) {
    throw new AppError(400, "Invalid or expired voucher code");
  }

  const now = new Date();
  if (!isVoucherValid(voucher, now)) {
    throw new AppError(400, "Voucher expired or already used");
  }

  discount.referralVoucherDiscount =
    grandTotal * (Number(voucher.discountAmount) / 100);
};

const checkItemStock = async (
  storeId: string,
  item: any,
  tx: any,
): Promise<void> => {
  const stock = await tx.stock.findUnique({
    where: { storeId_productId: { storeId, productId: item.productId } },
  });
  if (!stock || stock.quantity < item.quantity) {
    throw new AppError(400, `Insufficient stock: ${item.product.name}`);
  }
};

// Validate stock at specific store
export const validateStockAtStore = async (
  storeId: string,
  cartItems: any[],
  tx?: any,
): Promise<void> => {
  const client = tx || prisma;
  for (const item of cartItems) {
    await checkItemStock(storeId, item, client);
  }
};

const checkTotalStockItem = async (item: any, tx: any): Promise<void> => {
  const stocks = await tx.stock.findMany({
    where: { productId: item.productId },
  });

  const totalStock = stocks.reduce(
    (sum: number, stock: any) => sum + stock.quantity,
    0,
  );
  if (totalStock < item.quantity) {
    throw new AppError(
      400,
      `Insufficient total stock for product: ${item.product.name}`,
    );
  }
};

// Validate total stock from all stores
export const validateTotalStock = async (
  cartItems: any[],
  tx?: any,
): Promise<void> => {
  const client = tx || prisma;
  for (const item of cartItems) {
    await checkTotalStockItem(item, client);
  }
};

// Get store location info
export const getStoreLocationInfo = async (
  storeId: string,
  tx?: any,
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

// Get customer address info
export const getAddressLocationInfo = async (
  addressId: string,
  tx?: any,
): Promise<{ cityId: number; city: string }> => {
  const client = tx || prisma;
  const address = await client.address.findUnique({
    where: { addressId },
    select: { cityId: true, city: true },
  });

  if (!address) throw new AppError(404, "Address not found");
  return { cityId: address.cityId, city: address.city };
};

// calculate each product discount
export const calculateProductDiscount = async (
  cartItems: any[],
  discount: TDiscount,
  tx?: Prisma.TransactionClient,
) => {
  const client = tx || prisma;

  for (let item of cartItems) {
    const hasDiscount = await client.discount.findFirst({
      where: {
        productId: item.product.productId,
        validUntil: {
          gt: new Date(),
        },
      },
    });

    if (hasDiscount?.type === "NO_REQUIREMENT") {
      const subTotalItemPrice = item.product.price * item.quantity;
      const totalItemDiscount =
        (subTotalItemPrice * Number(hasDiscount.discountAmount)) / 100;

      discount.productItemDiscountAmmount += totalItemDiscount;
      item.discountAmount = totalItemDiscount;
    }

    if (hasDiscount?.type === "BUY_ONE_GET_ONE") {
      item.subtotal = item.quantity * item.product.price;
      item.quantity += item.quantity;
    }
  }
};
