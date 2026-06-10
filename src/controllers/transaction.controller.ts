import { Request, Response } from "express";
import { CreateTransactionInput } from "../schemas/createTransaction.schema";
import { transactionService } from "../services/transaction.service";
import { catchAsync } from "../utils/catchAsync.util";

export const transactionController = {
  createOrder: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user!.userId as string;
    const result = await transactionService.createOrder(
      userId,
      req.body as CreateTransactionInput,
    );

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: result,
    });
  }),
};
