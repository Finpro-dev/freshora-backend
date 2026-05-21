import { Request, Response } from "express";
import { createPasswordInput } from "../schemas/createPassword.schema";
import { SignupInput } from "../schemas/signup.schema";
import { VerificationRequestInput } from "../schemas/verificationRequest.schema";
import { authServices } from "../services/auth.service";
import { catchAsync } from "../utils/catchAsync.util";

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

  login: catchAsync((req: Request, res: Response) => {
    res.status(201).json({
      status: "success",
      message: "Login successfull",
    });
  }),
};
