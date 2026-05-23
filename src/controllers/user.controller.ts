import { Response } from "express";
import { userService } from "../services/user.service";
import { AuthenticatedRequest } from "../types/appRequest.type";
import { catchAsync } from "../utils/catchAsync.util";

export const userController = {
  getProfile: catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId as string;

    const user = await userService.getProfile(userId);

    res.status(200).json({
      status: "success",
      message: "User profile retrieved successfully",
      user,
    });
  }),
};
