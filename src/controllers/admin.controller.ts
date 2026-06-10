import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.util";
import { adminServices } from "../services/admin.service";

export const adminController = {
  getUsers: catchAsync(async (req: Request, res: Response) => {
    const users = await adminServices.getAllUsers(req.query);

    res.status(200).json({
      status: "success",
      message: "Users retrieved successfully",
      data: users,
    });
  }),
};
