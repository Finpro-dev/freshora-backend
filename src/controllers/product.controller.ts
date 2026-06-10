import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.util";
import { productServices } from "../services/product.service";

export const productController = {
  createProduct: catchAsync(async (req: Request, res: Response) => {
    const images = req.files as Express.Multer.File[];
    if (!images || images.length === 0) {
      return res.status(400).json({ message: "Product images are required" });
    }
    await productServices.createProduct({ ...req.body, images });

    res.status(200).json({
      status: "success",
      message: "Product created successfully",
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
