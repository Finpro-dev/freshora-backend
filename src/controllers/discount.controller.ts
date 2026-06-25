import { catchAsync } from "../utils/catchAsync.util";
import { Request, Response } from "express";
import { discountServices } from "../services/discount.service";
import { CreateDiscountInput } from "../schemas/discount.schema";
import { getDiscountSchema } from "../schemas/discount.schema";

export const discountController = {
  getDiscount: catchAsync(async (req: Request, res: Response) => {
    const parsedData = getDiscountSchema.parse({ query: req.query });

    const filters = parsedData.query;
    const adminContext = { userId: req.user!.userId, role: req.user!.role };

    const discount = await discountServices.getDiscount(filters, adminContext);

    res.status(200).json({
      status: "success",
      data: discount,
    });
  }),

  createDiscount: catchAsync(
    async (req: Request<{}, {}, CreateDiscountInput>, res: Response) => {
      const adminContext = { userId: req.user!.userId, role: req.user!.role };

      const newDiscount = await discountServices.createDiscount(
        req.body,
        adminContext,
      );

      res.status(201).json({
        status: "success",
        message: "Discount created successfully",
        data: newDiscount,
      });
    },
  ),

  deleteDiscount: catchAsync(async (req: Request, res: Response) => {
    const { discountId } = req.params as { discountId: string };
    const adminContext = { userId: req.user!.userId, role: req.user!.role };

    await discountServices.deleteDiscount(discountId, adminContext);

    res.status(200).json({
      status: "success",
      message: "Discount deleted successfully",
    });
  }),
};
