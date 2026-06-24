import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.util";
import { stockService } from "../services/stock.service";

export const stockController = {
  // 1. GET ALL STOCKS (useGetStocks) - FIXED WITH PAGINATION, FILTER & SEARCH
  getStocks: catchAsync(async (req: Request, res: Response) => {
    const { role, storeId: adminStoreId } = req.user as any;

    // Tangkap query parameter dari frontend
    const storeIdQuery = req.query.storeId as string | undefined;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const search = (req.query.search as string) || "";

    let storeId = storeIdQuery;

    // Aturan Bisnis: Jika Store Admin, paksa hanya melihat toko miliknya sendiri
    if (role === "STORE_ADMIN") {
      // Menggunakan adminStoreId dari token, jika kosong gunakan storeIdQuery sebagai fallback sementara
      storeId = adminStoreId;

      if (!storeId) {
        return res.status(403).json({
          status: "error",
          message: "Akses ditolak. Anda tidak memiliki ID Toko yang valid.",
        });
      }
    } else if (role === "SUPER_ADMIN") {
      // SUPER_ADMIN bisa filter via query param atau lihat semua
      storeId = req.query.storeId as string | undefined;
    }

    // Panggil service dengan membawa seluruh parameter filter
    const result = await stockService.findAllStocks({
      storeId,
      page,
      limit,
      search,
    });

    res.status(200).json({
      status: "success",
      message: "Stocks retrieved successfully",
      ...result, // Menyertakan object 'data' dan 'pagination' ke response JSON
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
