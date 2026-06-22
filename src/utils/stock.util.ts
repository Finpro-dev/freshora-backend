import { Prisma } from "../../generated/prisma/client";
import { AppError } from "./appError.util";
import { prisma } from "../configs/prisma.config";

// Checks and decrements stock inside a Prisma transaction
export const decrementStock = async (
  storeId: string,
  productId: string,
  quantity: number,
  _transactionId: string,
  tx: Prisma.TransactionClient,
) => {
  const stock = await tx.stock.findUnique({
    where: { storeId_productId: { storeId, productId } },
  });

  if (!stock || stock.quantity < quantity) {
    const available = stock?.quantity ?? 0;

    const product = await tx.product.findUnique({
      where: { productId },
    });

    throw new AppError(
      400,
      `Insufficient stock for product ${product?.name}: requested ${quantity}, available ${available}`,
    );
  }

  await tx.stock.update({
    where: { storeId_productId: { storeId, productId } },
    data: { quantity: { decrement: quantity } },
  });
};

// Create mutation alert for insufficient stock (outside transaction)
export const createMutationAlert = async (
  storeId: string,
  productId: string,
  requestedQuantity: number,
  availableQuantity: number,
) => {
  const neededQuantity = requestedQuantity - availableQuantity;

  return await prisma.mutation.create({
    data: {
      productId,
      fromStoreId: storeId, // Will be updated by Super Admin
      toStoreId: storeId,   // Store that needs stock
      quantity: neededQuantity,
      mutationStatus: "PENDING",
    },
  });
};

// Find stores with available stock for a product, sorted by distance
export const findStoresWithStock = async (
  productId: string,
  targetStoreId: string,
  requiredQuantity: number,
) => {
  const targetStore = await prisma.store.findUnique({
    where: { storeId: targetStoreId },
  });

  if (!targetStore) return [];

  const storesWithStock = await prisma.stock.findMany({
    where: {
      productId,
      quantity: { gte: requiredQuantity },
      store: { deletedAt: null, storeId: { not: targetStoreId } },
    },
    include: { store: true },
  });

  if (!targetStore.latitude || !targetStore.longitude) {
    return storesWithStock.map((s: any) => ({ ...s.store, distance: 0 }));
  }

  const storesWithDistance = storesWithStock.map((stock: any) => {
    const distance = stock.store.latitude && stock.store.longitude
      ? haversineDistance(
          targetStore.latitude!,
          targetStore.longitude!,
          stock.store.latitude,
          stock.store.longitude,
        )
      : Infinity;
    return { ...stock.store, distance, availableQuantity: stock.quantity };
  });

  return storesWithDistance.sort((a: any, b: any) => a.distance - b.distance);
};

// Haversine distance calculation
const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const EARTH_RADIUS_KM = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};