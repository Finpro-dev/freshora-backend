import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.util";
import { stockService } from "../services/stock.service";

export const stockController = {
  // 1. GET ALL STOCKS (useGetStocks)
  getStocks: catchAsync(async (req: Request, res: Response) => {
    const { role, storeId: adminStoreId } = req.user as any;
    let storeId = req.query.storeId as string | undefined;

    // Aturan Bisnis: Jika Store Admin, paksa hanya melihat toko miliknya sendiri
    if (role === "STORE_ADMIN") {
      storeId = adminStoreId;
    }

    const stocks = await stockService.findAllStocks(storeId);

    res.status(200).json({
      status: "success",
      message: "Stocks retrieved successfully",
      data: stocks,
    });
  }),

  // 2. GET SINGLE STOCK BY ID (useGetStockById)
  getStockById: catchAsync(async (req: Request, res: Response) => {
    const { stockId } = req.params as { stockId: string };
    const { role, storeId: adminStoreId } = req.user as any;

    const stock = await stockService.findStockById(stockId);

    if (!stock) {
      return res.status(404).json({
        status: "error",
        message: "Data stok tidak ditemukan",
      });
    }

    // Validasi Keamanan: Store Admin tidak boleh mengintip stok toko lain via ID
    if (role === "STORE_ADMIN" && stock.storeId !== adminStoreId) {
      return res.status(403).json({
        status: "error",
        message: "Anda tidak memiliki akses ke toko ini",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Stock detail retrieved successfully",
      data: stock,
    });
  }),

  // 3. GET JOURNALS / LOG HISTORY (useGetStockJournals)
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

  // 4. UPDATE MUTASI STOK + JURNAL (useUpdateStock)
  updateStock: catchAsync(async (req: Request, res: Response) => {
    const { role, storeId: adminStoreId, userId } = req.user as any;
    let { productId, storeId, quantityChange, type } = req.body;

    // Aturan Bisnis: Kunci storeId berdasarkan tingkatan role admin
    if (role === "STORE_ADMIN") {
      storeId = adminStoreId;
    } else if (role === "SUPER_ADMIN" && !storeId) {
      return res.status(400).json({
        status: "error",
        message: "Super Admin wajib memilih toko terlebih dahulu.",
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
