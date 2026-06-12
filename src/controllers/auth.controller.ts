import { Request, Response } from "express";
import { LoginInput } from "../schemas/login.schema";
import { SignupInput } from "../schemas/signup.schema";
import { VerificationRequestInput } from "../schemas/verificationRequest.schema";
import { authServices } from "../services/auth.service";
import { AppError } from "../utils/appError.util";
import { catchAsync } from "../utils/catchAsync.util";
import { clearTokenCookies, setTokenCookies } from "../utils/token.util";
import { USER_EMAIL_VERIFY_COOKIE_OPTIONS } from "../configs/cookie.config";

export const authController = {
  signup: catchAsync(
    async (req: Request<{}, {}, SignupInput>, res: Response) => {
      res.cookie(
        "emailForVerify",
        req.body.email as string,
        USER_EMAIL_VERIFY_COOKIE_OPTIONS,
      );

      await authServices.signup(req.body);

      res.status(201).json({
        success: true,
        message: "User successfully created, check your email to verify",
      });
    },
  ),

  verifyRequest: catchAsync(
    async (req: Request<{}, {}, VerificationRequestInput>, res: Response) => {
      const email = req.cookies.emailForVerify || req.body.email;

      res.cookie(
        "emailForVerify",
        req.body.email as string,
        USER_EMAIL_VERIFY_COOKIE_OPTIONS,
      );

      await authServices.verifyRequest({
        email,
        verifyType: req.body.verifyType,
      });

      res.status(201).json({
        success: true,
        message: "Verification link has been sent to your email",
      });
    },
  ),

  login: catchAsync(async (req: Request<{}, {}, LoginInput>, res: Response) => {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } =
      (await authServices.login({
        email,
        password,
      })) || {};

    setTokenCookies(res, accessToken!, refreshToken!);

    res.status(201).json({
      success: true,
      message: "Login successful",
      data: {
        user,
      },
    });
  }),

  logout: catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    await authServices.logout(userId as string);

    clearTokenCookies(res);

    res.status(201).json({
      success: true,
      message: "Logout successful",
    });
  }),

  refresh: catchAsync(async (req: Request, res: Response) => {
    const storedRefreshToken = req.cookies.refreshToken;

    if (!storedRefreshToken)
      throw new AppError(401, "Your session has finished, please re-login");

    const { accessToken, refreshToken } =
      (await authServices.refresh(storedRefreshToken)) || {};

    if (accessToken && refreshToken)
      setTokenCookies(res, accessToken, refreshToken);

    res.status(200).json({
      success: true,
      message: "Token refreshed",
    });
  }),
};
