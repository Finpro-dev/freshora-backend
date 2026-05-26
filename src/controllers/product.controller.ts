import { Response } from "express";
import { AuthenticatedRequest } from "../types/appRequest.type";
import { catchAsync } from "../utils/catchAsync.util";
import { productServices } from "../services/product.service";

export const productController = {
  createProduct: catchAsync(
    async (req: AuthenticatedRequest, res: Response) => {
      const images = req.files as Express.Multer.File[];
      if (!images || images.length === 0) {
        return res.status(400).json({ message: "Product images are required" });
      }
      await productServices.createProduct({ ...req.body, images });

      res.status(200).json({
        status: "success",
        message: "Product created successfully",
      });
    },
  ),

  deleteProduct: catchAsync(
    async (req: AuthenticatedRequest, res: Response) => {
      res.status(200).json({
        status: "success",
        message: "Product deleted successfully",
      });
    },
  ),

  updateProduct: catchAsync(
    async (req: AuthenticatedRequest, res: Response) => {
      const images = req.files as Express.Multer.File[];
      const productId = Array.isArray(req.params.productId)
        ? req.params.productId[0]
        : req.params.productId;
      await productServices.updateProduct(productId, {
        ...req.body,
        images,
      });
      res.status(200).json({
        status: "success",
        message: "Product updated successfully",
      });
    },
  ),
};
