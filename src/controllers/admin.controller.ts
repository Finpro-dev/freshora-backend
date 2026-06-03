import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.util";
import { adminServices } from "../services/admin.service";
import { SignupInput } from "../schemas/signup.schema";
import { VerificationRequestInput } from "../schemas/verificationRequest.schema";
import { AppError } from "../utils/appErrror.util";

export const adminController = {
  getUsers: catchAsync(async (req: Request, res: Response) => {
    const users = await adminServices.getAllUsers(req.query);

    res.status(200).json({
      status: "success",
      message: "Users retrieved successfully",
      data: users,
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
  verifyRequest: catchAsync(
    async (req: Request<{}, {}, VerificationRequestInput>, res: Response) => {
      const { email } = req.body;
      await adminServices.verifyRequest(email);

      res.status(201).json({
        status: "success",
        message: "Verification link has been sent to your email",
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
