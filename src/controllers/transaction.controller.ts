import { Response } from "express";
import { AuthenticatedRequest } from "../types/appRequest.type";
import { CreateTransactionInput } from "../schemas/createTransaction.schema";
import { transactionService } from "../services/transaction.service";
import { catchAsync } from "../utils/catchAsync.util";

export const transactionController = {
  createOrder: catchAsync(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user?.userId as string;
      const result = await transactionService.createOrder(
        userId,
        req.body as CreateTransactionInput,
      );

      res.status(201).json({
        status: "success",
        message: "Order created successfully",
        data: result,
      });
    },
  ),
};
