import { Request, Response } from "express";
import { createPasswordInput } from "../schemas/createPassword.schema";
import { SignupInput } from "../schemas/signup.schema";
import { VerificationRequestInput } from "../schemas/verificationRequest.schema";
import { authServices } from "../services/auth.service";
import { catchAsync } from "../utils/catchAsync.util";
import { LoginInput } from "../schemas/login.schema";
import { clearTokenCookies, setTokenCookies } from "../utils/token.util";
import { AuthenticatedRequest } from "../types/appRequest.type";
import { AppError } from "../utils/appErrror.util";

export const authController = {
  signup: catchAsync(
    async (req: Request<{}, {}, SignupInput>, res: Response) => {
      await authServices.signup(req.body);

      res.status(201).json({
        status: "success",
        message: "User successfully created, check your email to verify",
      });
    },
  ),

  createPassword: catchAsync(
    async (
      req: Request<{}, {}, createPasswordInput & { token: string }>,
      res: Response,
    ) => {
      const { password, token } = req.body;

      await authServices.createPassword(password, token);

      res.status(201).json({
        status: "success",
        message: "Account is activated successfully",
      });
    },
  ),

  verifyRequest: catchAsync(
    async (req: Request<{}, {}, VerificationRequestInput>, res: Response) => {
      const { email } = req.body;
      await authServices.verifyRequest(email);

      res.status(201).json({
        status: "success",
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
      status: "success",
      message: "Login successfull",
      data: {
        user,
      },
    });
  }),

  logout: catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId as string;
    await authServices.logout(userId);

    clearTokenCookies(res);

    res.status(201).json({
      status: "success",
      message: "Logout successfull",
    });
  }),

  refresh: catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const storedRefreshToken = req.cookies.refreshToken; //FIXME
    console.log("refreshToken ==> ", storedRefreshToken);

    if (!storedRefreshToken)
      throw new AppError(401, "Your session has finsihed, please re-login");

    const { accessToken, refreshToken } =
      (await authServices.refresh(storedRefreshToken)) || {};

    if (accessToken && refreshToken)
      setTokenCookies(res, accessToken, refreshToken);

    res.status(200).json({
      status: "success",
      message: "Token refreshed",
    });
  }),
};
