import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.util";
import { productServices } from "../services/product.service";
import { ProductParamsInput } from "../schemas/product.schema";

export const productController = {
  getStoreProducts: catchAsync(async (req: Request, res: Response) => {
    const { role, storeId: adminStoreId } = req.user as any;

    let storeId = adminStoreId;
    if (!storeId && role !== "SUPER_ADMIN") {
      return res.status(403).json({
        status: "error",
        message: "Store ID required",
      });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const products = await productServices.getProductByStoreId(
      storeId,
      page,
      limit,
    );

    res.status(200).json({
      status: "success",
      data: products.products,
      pagination: {
        page,
        limit,
        totalItems: products.totalProduct,
        totalPages: products.totalPage,
      },
    });
  }),

  getAllProducts: catchAsync(async (req: Request, res: Response) => {
    const { page, limit, search, category } =
      req.query as unknown as ProductParamsInput;
    const products = await productServices.getAllProducts({
      page,
      limit,
      search,
      category,
    });
    res.status(200).json({
      status: "success",
      ...products,
    });
  }),

  getProductByStoreId: catchAsync(async (req: Request, res: Response) => {
    const storeId = req.params.storeId as string;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 30;

    const products = await productServices.getProductByStoreId(
      storeId,
      page,
      limit,
    );

    res.status(200).json({
      success: true,
      data: products,
    });
  }),

  getProductById: catchAsync(async (req: Request, res: Response) => {
    const { productId } = req.params as { productId: string };
    const product = await productServices.getProductById(productId);
    res.status(200).json({
      status: "success",
      data: product,
    });
  }),

  getProductBySlug: catchAsync(async (req: Request, res: Response) => {
    const { slug } = req.params as { slug: string };
    const product = await productServices.getProductBySlug(slug);
    res.status(200).json({
      status: "success",
      data: product,
    });
  }),

  createProduct: catchAsync(async (req: Request, res: Response) => {
    const images = req.files as Express.Multer.File[];
    if (!images || images.length === 0) {
      return res.status(400).json({ message: "Product images are required" });
    }
    const newProduct = await productServices.createProduct({
      ...req.body,
      images,
    });

    res.status(201).json({
      status: "success",
      message: "Product created successfully",
      data: newProduct,
    });
  }),

  deleteProduct: catchAsync(async (req: Request, res: Response) => {
    const { productId } = req.params as { productId: string };
    await productServices.deleteProduct(productId);
    res.status(200).json({
      status: "success",
      message: "Product deleted successfully",
    });
  }),

  updateProduct: catchAsync(async (req: Request, res: Response) => {
    const images = req.files as Express.Multer.File[];
    const { productId } = req.params as { productId: string };
    await productServices.updateProduct(productId, {
      ...req.body,
      images,
    });
    res.status(200).json({
      status: "success",
      message: "Product updated successfully",
    });
  }),
};
