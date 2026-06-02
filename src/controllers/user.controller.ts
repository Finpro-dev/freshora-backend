import { Request, Response } from "express";
import { userService } from "../services/user.service";
// import { AuthenticatedRequest } from "../types/appRequest.type";
import { catchAsync } from "../utils/catchAsync.util";
import { clearTokenCookies } from "../utils/token.util";
import { USER_EMAIL_VERIFY_COOKIE_OPTIONS } from "../configs/cookie.config";

export const userController = {
  getProfile: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;

    const user = await userService.getProfile(userId);

    res.status(200).json({
      status: "success",
      message: "User profile retrieved successfully",
      user,
    });
  }),

  updateProfile: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const avatar = req.file as Express.Multer.File;

    const updatedUser = await userService.updateProfile(
      userId,
      avatar,
      req.body,
    );

    res.status(200).json({
      status: "success",
      message: "Profile updated successfully",
      user: updatedUser,
    });
  }),

  verifyEmail: catchAsync(async (req: Request, res: Response) => {
    const token = req.params.token as string;

    clearTokenCookies(res);
    await userService.verifyEmail(token);
    res.clearCookie("emailForVerify", USER_EMAIL_VERIFY_COOKIE_OPTIONS);

    res.status(200).json({
      status: "success",
      message: "Email is verified successfully",
    });
  }),

  getAllUnassignUsers: catchAsync(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 1;
    const search = req.query.search as string;

    const data = await userService.getAllUnassignedAdmin(page, limit, search);
    res.status(200).json({
      status: "success",
      message: "Unassigned store admin is retrieved successfully",
      data,
    });
  }),
};
