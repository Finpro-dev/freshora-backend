import { prisma } from "../configs/prisma.config";
import { AppError } from "./appErrror.util";

const EARTH_RADIUS_KM = 6371;

const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getStoresWithCoordinates = (tx: any) =>
  tx.store.findMany({
    where: { latitude: { not: null }, longitude: { not: null } },
  });

const findClosestStore = (
  stores: any[],
  lat: number,
  lon: number,
): string => {
  let closest = stores[0];
  let minDist = haversineDistance(lat, lon, closest.latitude!, closest.longitude!);
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
  if (stores.length === 0) throw new AppError(400, "No stores with valid coordinates available");
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
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `TSX-${timestamp}-${random}`;
};

const findVoucherByCode = (code: string, tx: any) =>
  tx.referralVoucher.findUnique({
    where: { couponCode: code.toUpperCase() },
  });

const isVoucherValid = (v: any, now: Date): boolean =>
  !!v && now >= v.validFrom && now <= v.validUntil && !v.transactionId;

export const validateVoucher = async (
  voucherCode: string,
  userId: string,
  tx?: any,
): Promise<number> => {
  if (!voucherCode) return 0;

  const client = tx || prisma;
  const voucher = await findVoucherByCode(voucherCode, client);
  if (!voucher || voucher.userId !== userId) {
    throw new AppError(400, "Invalid or expired voucher code");
  }

  const now = new Date();
  if (!isVoucherValid(voucher, now)) {
    throw new AppError(400, "Voucher expired or already used");
  }

  return Number(voucher.discountAmount);
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
