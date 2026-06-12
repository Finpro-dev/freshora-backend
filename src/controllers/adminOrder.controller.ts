import { Request, Response } from "express";
import { prisma } from "../configs/prisma.config";
import { AdminOrderListInput } from "../schemas/adminOrder.schema";
import {
  getAllOrders,
  getOrderDetail,
  getOrderStats,
} from "../services/adminOrderRead.service";
import {
  cancelOrder,
  updateOrderToShipping,
} from "../services/adminOrderWrite.service";
import { catchAsync } from "../utils/catchAsync.util";

export const adminOrderController = {
  getAllOrders: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId as string;
    const role = req.user!.role as string;

    let storeId: string | null = null;
    if (role === "STORE_ADMIN") {
      const store = await prisma.store.findUnique({ where: { userId } });
      storeId = store?.storeId || null;
    }

    const filters = req.query as unknown as AdminOrderListInput;
    const result = await getAllOrders(role, storeId, filters);

    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: result,
    });
  }),

  getOrderDetail: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId as string;
    const role = req.user!.role as string;
    const transactionId = req.params.transactionId as string;

    let storeId: string | null = null;
    if (role === "STORE_ADMIN") {
      const store = await prisma.store.findUnique({ where: { userId } });
      storeId = store?.storeId || null;
    }

    const order = await getOrderDetail(transactionId, role, storeId);

    res.status(200).json({
      success: true,
      message: "Order detail retrieved successfully",
      data: order,
    });
  }),

  updateOrderToShipping: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId as string;
    const role = req.user!.role as string;
    const transactionId = req.params.transactionId as string;

    let storeId: string | null = null;
    if (role === "STORE_ADMIN") {
      const store = await prisma.store.findUnique({ where: { userId } });
      storeId = store?.storeId || null;
    }

    await updateOrderToShipping(transactionId, role, storeId);

    res.status(200).json({
      success: true,
      message: "Order status updated to SHIPPING",
    });
  }),

  cancelOrder: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId as string;
    const role = req.user!.role as string;
    const transactionId = req.params.transactionId as string;

    let storeId: string | null = null;
    if (role === "STORE_ADMIN") {
      const store = await prisma.store.findUnique({ where: { userId } });
      storeId = store?.storeId || null;
    }

    await cancelOrder(transactionId, role, storeId);

    res.status(200).json({
      success: true,
      message: "Order canceled successfully",
    });
  }),

  getOrderStats: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId as string;
    const role = req.user!.role as string;

    let storeId: string | null = null;
    if (role === "STORE_ADMIN") {
      const store = await prisma.store.findUnique({ where: { userId } });
      storeId = store?.storeId || null;
    }

    const stats = await getOrderStats(role, storeId);

    res.status(200).json({
      success: true,
      message: "Order statistics retrieved successfully",
      data: stats,
    });
  }),
};
