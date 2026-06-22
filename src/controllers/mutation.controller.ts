import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.util";
import {
  getAllMutations,
  getMutationDetail,
  createMutation,
  updateMutationStatus,
  getMutationStats,
} from "../services/mutation.service";
import { prisma } from "../configs/prisma.config";
import { MutationListInput, CreateMutationInput, MutationDetailInput } from "../schemas/mutation.schema";

// Get all mutations
export const mutationController = {
  getAllMutations: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId as string;
    const role = req.user!.role as string;

    let storeId: string | null = null;
    if (role === "STORE_ADMIN") {
      const store = await prisma.store.findUnique({ where: { userId } });
      storeId = store?.storeId || null;
    }

    const filters = req.query as unknown as MutationListInput;
    const result = await getAllMutations(role, storeId, filters);

    res.status(200).json({
      success: true,
      message: "Mutations retrieved successfully",
      data: result,
    });
  }),

  getMutationDetail: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId as string;
    const role = req.user!.role as string;
    const { mutationId } = req.params as unknown as MutationDetailInput;

    let storeId: string | null = null;
    if (role === "STORE_ADMIN") {
      const store = await prisma.store.findUnique({ where: { userId } });
      storeId = store?.storeId || null;
    }

    const mutation = await getMutationDetail(mutationId, role, storeId);

    res.status(200).json({
      success: true,
      message: "Mutation detail retrieved successfully",
      data: mutation,
    });
  }),

  createMutation: catchAsync(async (req: Request, res: Response) => {
    const data = req.body as CreateMutationInput;
    const mutation = await createMutation(data);

    res.status(201).json({
      success: true,
      message: "Mutation created successfully",
      data: mutation,
    });
  }),

  updateMutationStatus: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId as string;
    const role = req.user!.role as string;
    const { mutationId } = req.params;
    const { status } = req.body as { status: "PROCESSED" | "SHIPPING" | "REJECTED" | "COMPLETED" };

    let storeId: string | null = null;
    if (role === "STORE_ADMIN") {
      const store = await prisma.store.findUnique({ where: { userId } });
      storeId = store?.storeId || null;
    }

    const result = await updateMutationStatus(mutationId as string, status, role, storeId);

    res.status(200).json({
      success: true,
      message: result?.message || "Status updated",
    });
  }),

  getMutationStats: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId as string;
    const role = req.user!.role as string;

    let storeId: string | null = null;
    if (role === "STORE_ADMIN") {
      const store = await prisma.store.findUnique({ where: { userId } });
      storeId = store?.storeId || null;
    }

    const stats = await getMutationStats(role, storeId);

    res.status(200).json({
      success: true,
      message: "Mutation statistics retrieved successfully",
      data: stats,
    });
  }),
};