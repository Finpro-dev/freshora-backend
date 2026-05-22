import { Response } from "express";
import { AuthenticatedRequest } from "../types/appRequest.type";
import { catchAsync } from "../utils/catchAsync.util";

export const productController = {
  createProduct: catchAsync(
    async (req: AuthenticatedRequest, res: Response) => {
      res.status(200).json({
        status: "success",
        message: "Product created successfully",
      });
    },
  ),
};
