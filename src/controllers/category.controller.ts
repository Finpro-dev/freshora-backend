import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.util";
import { categoryServices } from "../services/category.service";
import { CreateCategoryInput } from "../schemas/category.schema";

export const categoryController = {
  getProductCategories: catchAsync(async (req: Request, res: Response) => {
    const productCategories = await categoryServices.getProductCategories();
    res.status(200).json({
      status: "success",
      message: "Categories retrieved successfully",
      data: productCategories,
    });
  }),
  createProductCategory: catchAsync(
    async (req: Request<{}, {}, CreateCategoryInput>, res: Response) => {
      await categoryServices.createProductCategory(req.body);

      res.status(201).json({
        status: "success",
        message: "Category created successfully",
      });
    },
  ),
  updateProductCategories: catchAsync(async (req: Request, res: Response) => {
    const { productCategoryId } = req.params as { productCategoryId: string };
    await categoryServices.updateProductCategories(productCategoryId, req.body);
    res.status(200).json({
      status: "success",
      message: "Category updated successfully",
    });
  }),
  deleteProductCategories: catchAsync(async (req: Request, res: Response) => {
    const { productCategoryId } = req.params as { productCategoryId: string };
    await categoryServices.deleteProductCategories(productCategoryId);
    res.status(200).json({
      status: "success",
      message: "Category deleted successfully",
    });
  }),
};
