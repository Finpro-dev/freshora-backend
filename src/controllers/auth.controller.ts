import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.util";
import { authServices } from "../services/auth.service";
import { emailService } from "../services/email.service";
import { AppError } from "../utils/appErrror.util";
import { SignupInput } from "../schemas/signup.schema";
import { createPasswordInput } from "../schemas/createPassword.schema";
import { TokenPayload } from "../types/token.type";
import { AuthenticatedRequest } from "../types/appRequest.type";

export const authController = {
  signup: catchAsync(
    async (req: Request<{}, {}, SignupInput>, res: Response) => {
      const newUser = await authServices.signup(req.body);

      const fullName = `${newUser.firstName} ${newUser.lastName}`;
      const email = newUser.email;
      const token = newUser.token;

      try {
        await emailService.sendVerificationEmail(fullName, email, token);
      } catch {
        throw new AppError(408, "Unable to send email verification");
      }

      res.status(201).json({
        status: "success",
        message: "User successfully created",
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
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.user?.userId as string;
      const { fullName, email, token } =
        await authServices.verifyRequest(userId);

      try {
        await emailService.sendVerificationEmail(fullName, email, token);
      } catch {
        throw new AppError(408, "Unable to send email verification");
      }

      res.status(201).json({
        status: "success",
        message: "Account is activated successfully",
      });
    },
  ),

  login: catchAsync((req: Request, res: Response) => {
    res.status(201).json({
      status: "success",
      message: "Login successfull",
    });
  }),
};
