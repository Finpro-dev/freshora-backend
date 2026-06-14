import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.util";
import { adminServices } from "../services/admin.service";
import { SignupInput } from "../schemas/signup.schema";
import { VerificationRequestInput } from "../schemas/verificationRequest.schema";
import { AppError } from "../utils/appError.util";
import { GetUsersQuery } from "../schemas/admin.schema";

export const adminController = {
  getUsers: catchAsync(
    async (req: Request<{}, {}, {}, GetUsersQuery>, res: Response) => {
      const users = await adminServices.getAllUsers(req.query);

      res.status(200).json({
        status: "success",
        message: "Users retrieved successfully",
        data: users,
      });
    },
  ),

  getUserById: catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params as { userId: string };
    const userDetails = await adminServices.getUserById(userId);

    res.status(200).json({
      status: "success",
      message: "User details retrieved successfully",
      data: userDetails,
    });
  }),

  createStoreAdmin: catchAsync(
    async (req: Request<{}, {}, SignupInput>, res: Response) => {
      await adminServices.createStoreAdmin(req.body);

      res.status(201).json({
        status: "success",
        message: "Store admin created successfully",
      });
    },
  ),

  updateStoreAdmin: catchAsync(async (req: Request, res: Response) => {}),

  deleteStoreAdmin: catchAsync(async (req: Request, res: Response) => {
    const { adminId } = req.params;
    if (!adminId || typeof adminId !== "string") {
      throw new AppError(400, "Invalid or missing admin ID");
    }

    await adminServices.deleteStoreAdmin(adminId);
    res.status(200).json({
      status: "success",
      message: "Store admin deleted successfully",
    });
  }),
};
