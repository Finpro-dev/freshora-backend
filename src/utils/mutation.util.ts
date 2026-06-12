import { Prisma, MutationStatus } from "../../generated/prisma/client";
import { AppError } from "./appError.util";
import { createStockJournal } from "./stockJournal.util";

// Valid status transitions for mutation workflow
export const MUTATION_TRANSITIONS: Record<MutationStatus, MutationStatus[]> = {
  PENDING: ["PROCESSED", "REJECTED"],
  PROCESSED: ["SHIPPING", "REJECTED"],
  SHIPPING: ["COMPLETED", "REJECTED"],
  COMPLETED: [],
  REJECTED: [],
};

// Validate mutation status transition
export const validateMutationStatusTransition = (
  currentStatus: MutationStatus,
  newStatus: MutationStatus
): void => {
  const allowed = MUTATION_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(newStatus)) {
    throw new AppError(400, `Cannot change status from ${currentStatus} to ${newStatus}`);
  }
};

// Deduct stock from source store and create journal
export const deductSourceStock = async (
  storeId: string,
  productId: string,
  quantity: number,
  mutationId: string,
  tx: Prisma.TransactionClient
) => {
  const sourceStock = await tx.stock.findUnique({
    where: { storeId_productId: { storeId, productId } },
  });

  if (!sourceStock || sourceStock.quantity < quantity) {
    throw new AppError(400, "Insufficient stock at source store");
  }

  await tx.stock.update({
    where: { stockId: sourceStock.stockId },
    data: { quantity: { decrement: quantity } },
  });

  await createStockJournal(sourceStock.stockId, -quantity, "MUTATION_OUT", tx, undefined, mutationId);
};

// Add stock to destination store and create journal
export const addDestStock = async (
  storeId: string,
  productId: string,
  quantity: number,
  mutationId: string,
  tx: Prisma.TransactionClient
) => {
  const destStock = await tx.stock.findUnique({
    where: { storeId_productId: { storeId, productId } },
  });

  if (destStock) {
    await tx.stock.update({
      where: { stockId: destStock.stockId },
      data: { quantity: { increment: quantity } },
    });
    await createStockJournal(destStock.stockId, quantity, "MUTATION_IN", tx, undefined, mutationId);
  } else {
    const newStock = await tx.stock.create({
      data: { storeId, productId, quantity },
    });
    await createStockJournal(newStock.stockId, quantity, "MUTATION_IN", tx, undefined, mutationId);
  }
};

// Handle mutation status update with stock operations
export const handleMutationStatusUpdate = async (
  mutationId: string,
  mutation: { fromStoreId: string; toStoreId: string; productId: string; quantity: number },
  newStatus: MutationStatus,
  tx: Prisma.TransactionClient
) => {
  await tx.mutation.update({
    where: { mutationId },
    data: { mutationStatus: newStatus },
  });

  if (newStatus === "SHIPPING") {
    await deductSourceStock(mutation.fromStoreId, mutation.productId, mutation.quantity, mutationId, tx);
  }

  if (newStatus === "COMPLETED") {
    await addDestStock(mutation.toStoreId, mutation.productId, mutation.quantity, mutationId, tx);
  }
};