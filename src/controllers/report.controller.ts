import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.util";
import { reportService } from "../services/report.service";
import { SalesReportInput, StockReportInput, StockDetailReportInput } from "../schemas/report.schema";
import { prisma } from "../configs/prisma.config";

export const reportController = {
  getMonthlySalesReport: catchAsync(async (req: Request<{}, {}, {}, SalesReportInput>, res: Response) => {
    const userId = req.user!.userId as string;
    const role = req.user!.role as string;

    let storeId: string | null = req.query.storeId || null;
    if (role === "STORE_ADMIN") {
      const store = await prisma.store.findUnique({ where: { userId } });
      storeId = store?.storeId || null;
    }

    const data = await reportService.getMonthlySalesReport(storeId, req.query);

    res.status(200).json({
      status: "success",
      message: "Monthly sales report retrieved successfully",
      data,
    });
  }),

  getMonthlySalesByCategory: catchAsync(async (req: Request<{}, {}, {}, SalesReportInput>, res: Response) => {
    const userId = req.user!.userId as string;
    const role = req.user!.role as string;

    let storeId: string | null = req.query.storeId || null;
    if (role === "STORE_ADMIN") {
      const store = await prisma.store.findUnique({ where: { userId } });
      storeId = store?.storeId || null;
    }

    const data = await reportService.getMonthlySalesByCategory(storeId, req.query);

    res.status(200).json({
      status: "success",
      message: "Monthly sales by category retrieved successfully",
      data,
    });
  }),

  getMonthlySalesByProduct: catchAsync(async (req: Request<{}, {}, {}, SalesReportInput>, res: Response) => {
    const userId = req.user!.userId as string;
    const role = req.user!.role as string;

    let storeId: string | null = req.query.storeId || null;
    if (role === "STORE_ADMIN") {
      const store = await prisma.store.findUnique({ where: { userId } });
      storeId = store?.storeId || null;
    }

    const data = await reportService.getMonthlySalesByProduct(storeId, req.query);

    res.status(200).json({
      status: "success",
      message: "Monthly sales by product retrieved successfully",
      data,
    });
  }),

  getMonthlyStockSummary: catchAsync(async (req: Request<{}, {}, {}, StockReportInput>, res: Response) => {
    const userId = req.user!.userId as string;
    const role = req.user!.role as string;

    let storeId: string | null = req.query.storeId || null;
    if (role === "STORE_ADMIN") {
      const store = await prisma.store.findUnique({ where: { userId } });
      storeId = store?.storeId || null;
    }

    const data = await reportService.getMonthlyStockSummary(storeId, req.query);

    res.status(200).json({
      status: "success",
      message: "Monthly stock summary retrieved successfully",
      data,
    });
  }),

  getStockDetailReport: catchAsync(async (req: Request<{}, {}, {}, StockDetailReportInput>, res: Response) => {
    const userId = req.user!.userId as string;
    const role = req.user!.role as string;

    let storeId: string | null = req.query.storeId || null;
    if (role === "STORE_ADMIN") {
      const store = await prisma.store.findUnique({ where: { userId } });
      storeId = store?.storeId || null;
    }

    const data = await reportService.getStockDetailReport(storeId, req.query);

    res.status(200).json({
      status: "success",
      message: "Stock detail report retrieved successfully",
      data,
    });
  }),
};