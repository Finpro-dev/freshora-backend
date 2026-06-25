import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.util";
import { stockService } from "../services/stock.service";

export const stockController = {
  getStocks: catchAsync(async (req: Request, res: Response) => {
    const { role, storeId: adminStoreId } = req.user as any;

    // Tangkap query parameter dari frontend
    const storeIdQuery = req.query.storeId as string | undefined;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const search = (req.query.search as string) || "";

    let storeId = storeIdQuery;

    if (role === "STORE_ADMIN") {
      storeId = adminStoreId;

      if (!storeId) {
        return res.status(403).json({
          status: "error",
          message: "Accses denied. You do not have a valid Store ID.",
        });
      }
    } else if (role === "SUPER_ADMIN") {
      storeId = req.query.storeId as string | undefined;
    }

    const result = await stockService.findAllStocks({
      storeId,
      page,
      limit,
      search,
    });

    res.status(200).json({
      status: "success",
      message: "Stocks retrieved successfully",
      ...result,
    });
  }),

  getStockById: catchAsync(async (req: Request, res: Response) => {
    const { stockId } = req.params as { stockId: string };
    const { role, storeId: adminStoreId } = req.user as any;

    const stock = await stockService.findStockById(stockId);

    if (!stock) {
      return res.status(404).json({
        status: "error",
        message: "Stock Data Not Found",
      });
    }

    if (role === "STORE_ADMIN" && stock.storeId !== adminStoreId) {
      return res.status(403).json({
        status: "error",
        message: "You dont have access to this store",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Stock detail retrieved successfully",
      data: stock,
    });
  }),

  getStockJournals: catchAsync(async (req: Request, res: Response) => {
    const { role, storeId: adminStoreId } = req.user as any;
    let storeId = req.query.storeId as string | undefined;

    if (role === "STORE_ADMIN") {
      storeId = adminStoreId;
    }

    const journals = await stockService.findAllJournals(storeId);

    res.status(200).json({
      status: "success",
      message: "Stock journals retrieved successfully",
      data: journals,
    });
  }),

  updateStock: catchAsync(async (req: Request, res: Response) => {
    const { role, storeId: adminStoreId, userId } = req.user as any;
    let { productId, storeId, quantityChange, type } = req.body;

    if (role === "STORE_ADMIN") {
      storeId = adminStoreId;
    } else if (role === "SUPER_ADMIN" && !storeId) {
      return res.status(400).json({
        status: "error",
        message: "Super Admin Must Choose a Store.",
      });
    }

    const result = await stockService.processStockAdjustment({
      productId,
      storeId,
      quantityChange,
      type,
      userId,
    });

    res.status(200).json({
      status: "success",
      message: "Stock updated and journaled successfully",
      data: result,
    });
  }),
};
