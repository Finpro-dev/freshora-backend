import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../configs/prisma.config";
import { AppError } from "../utils/appError.util";
import { handlePrismaError } from "../utils/prismaErrorHandler.util";
import { createStockJournal } from "../utils/stockJournal.util";
import { validateMutationStatusTransition, handleMutationStatusUpdate } from "../utils/mutation.util";
import { MutationListInput, CreateMutationInput } from "../schemas/mutation.schema";

// Get all mutations with pagination, filtering, sorting
export const getAllMutations = async (
  role: string,
  storeId: string | null,
  filters: MutationListInput
) => {
  try {
    const { search, productId, status, fromStoreId, toStoreId, startDate, endDate, sortBy, sortOrder, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.MutationWhereInput = { deletedAt: null };

    if (role === "STORE_ADMIN" && storeId) {
      where.OR = [{ fromStoreId: storeId }, { toStoreId: storeId }];
    }

    if (productId) where.productId = productId;
    if (status) where.mutationStatus = status;
    if (fromStoreId) where.fromStoreId = fromStoreId;
    if (toStoreId) where.toStoreId = toStoreId;

    if (startDate) {
      const start = new Date(startDate);
      if (!isNaN(start.getTime())) where.createdAt = { gte: start };
    }

    if (endDate) {
      const end = new Date(endDate);
      if (!isNaN(end.getTime())) where.createdAt = { ...(where.createdAt as object || {}), lte: end };
    }

    if (search) {
      where.product = { name: { contains: search, mode: "insensitive" } };
    }

    const [mutations, total] = await Promise.all([
      prisma.mutation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          product: { select: { productId: true, name: true } },
          fromStore: { select: { storeId: true, name: true, address: true } },
          toStore: { select: { storeId: true, name: true, address: true } },
        },
      }),
      prisma.mutation.count({ where }),
    ]);

    return {
      mutations,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasNextPage: page < Math.ceil(total / limit) },
    };
  } catch (error) {
    handlePrismaError(error);
  }
};

// Get single mutation detail
export const getMutationDetail = async (mutationId: string, role: string, storeId: string | null) => {
  try {
    const where: Prisma.MutationWhereInput = { mutationId, deletedAt: null };

    if (role === "STORE_ADMIN" && storeId) {
      where.OR = [{ fromStoreId: storeId }, { toStoreId: storeId }];
    }

    const mutation = await prisma.mutation.findFirst({
      where,
      include: {
        product: { select: { productId: true, name: true } },
        fromStore: { select: { storeId: true, name: true, address: true, phone: true } },
        toStore: { select: { storeId: true, name: true, address: true, phone: true } },
        stockJournals: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!mutation) throw new AppError(404, "Mutation not found");
    return mutation;
  } catch (error) {
    handlePrismaError(error);
  }
};

// Create new mutation (Super Admin only)
export const createMutation = async (data: CreateMutationInput) => {
  try {
    const { productId, fromStoreId, toStoreId, quantity } = data;

    const [fromStore, toStore] = await Promise.all([
      prisma.store.findUnique({ where: { storeId: fromStoreId } }),
      prisma.store.findUnique({ where: { storeId: toStoreId } }),
    ]);

    if (!fromStore) throw new AppError(404, "Source store not found");
    if (!toStore) throw new AppError(404, "Destination store not found");
    if (fromStoreId === toStoreId) throw new AppError(400, "Source and destination store cannot be the same");

    const sourceStock = await prisma.stock.findUnique({
      where: { storeId_productId: { storeId: fromStoreId, productId } },
    });

    if (!sourceStock || sourceStock.quantity < quantity) {
      throw new AppError(400, `Insufficient stock at source store: available ${sourceStock?.quantity ?? 0}, required ${quantity}`);
    }

    const mutation = await prisma.$transaction(async (tx) => {
      const newMutation = await tx.mutation.create({
        data: { productId, fromStoreId, toStoreId, quantity, mutationStatus: "PROCESSED" },
      });

      await createStockJournal(sourceStock.stockId, -quantity, "MUTATION_OUT", tx, undefined, newMutation.mutationId);

      return newMutation;
    });

    return mutation;
  } catch (error) {
    handlePrismaError(error);
  }
};

// Update mutation status
export const updateMutationStatus = async (
  mutationId: string,
  newStatus: "PROCESSED" | "SHIPPING" | "REJECTED" | "COMPLETED",
  role: string,
  storeId: string | null,
) => {
  try {
    const where: Prisma.MutationWhereInput = { mutationId, deletedAt: null };

    if (role === "STORE_ADMIN" && storeId) {
      where.OR = [{ fromStoreId: storeId }, { toStoreId: storeId }];
    }

    const mutation = await prisma.mutation.findFirst({ where });

    if (!mutation) throw new AppError(404, "Mutation not found");

    validateMutationStatusTransition(mutation.mutationStatus, newStatus);

    await prisma.$transaction(async (tx) => {
      await handleMutationStatusUpdate(mutationId, mutation, newStatus, tx);
    });

    return { message: `Mutation status updated to ${newStatus}` };
  } catch (error) {
    handlePrismaError(error);
  }
};

// Get mutation statistics
export const getMutationStats = async (role: string, storeId: string | null) => {
  try {
    const where: Prisma.MutationWhereInput = { deletedAt: null };

    if (role === "STORE_ADMIN" && storeId) {
      where.OR = [{ fromStoreId: storeId }, { toStoreId: storeId }];
    }

    const [stats, pendingCount] = await Promise.all([
      prisma.mutation.groupBy({ by: ["mutationStatus"], where, _count: true }),
      prisma.mutation.count({ where: { ...where, mutationStatus: "PENDING" } }),
    ]);

    const statusCounts = stats.reduce((acc: Record<string, number>, item) => {
      acc[item.mutationStatus] = item._count;
      return acc;
    }, {});

    return {
      statusCounts: {
        PENDING: statusCounts["PENDING"] || 0,
        PROCESSED: statusCounts["PROCESSED"] || 0,
        SHIPPING: statusCounts["SHIPPING"] || 0,
        COMPLETED: statusCounts["COMPLETED"] || 0,
        REJECTED: statusCounts["REJECTED"] || 0,
      },
      pendingAlerts: pendingCount,
      totalMutations: Object.values(statusCounts).reduce((a, b) => a + b, 0),
    };
  } catch (error) {
    handlePrismaError(error);
  }
};