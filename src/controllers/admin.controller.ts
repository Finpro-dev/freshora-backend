import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.util";
import { adminServices } from "../services/admin.service";
import { AuthenticatedRequest } from "../types/appRequest.type";

export const adminController = {
  getUsers: catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const users = await adminServices.getAllUsers();

    res.status(200).json({
      status: "success",
      message: "Users retrieved successfully",
      data: users,
    });
  }),
};
