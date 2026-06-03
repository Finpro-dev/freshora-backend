import { Request, Response } from "express";
import { passwordService } from "../services/password.service";
import { catchAsync } from "../utils/catchAsync.util";
import { CreatePasswordInput } from "../schemas/createPassword.schema";
import {
  ResetPasswordInput,
  SetNewPasswordParams,
} from "../schemas/resetPassword.schema";
import { clearTokenCookies } from "../utils/token.util";
import { USER_EMAIL_VERIFY_COOKIE_OPTIONS } from "../configs/cookie.config";

export const passwordController = {
  createPassword: catchAsync(
    async (
      req: Request<SetNewPasswordParams, {}, CreatePasswordInput>,
      res: Response,
    ) => {
      const { token } = req.params;
      const { password } = req.body;

      await passwordService.createPassword(password, token);

      res.clearCookie("emailForVerify", USER_EMAIL_VERIFY_COOKIE_OPTIONS);

      res.status(201).json({
        status: "success",
        message: "Account is activated successfully",
      });
    },
  ),

  // send & resend request
  resetPassword: catchAsync(
    async (req: Request<{}, {}, ResetPasswordInput>, res: Response) => {
      const email = req.cookies.emailForVerify || req.body.email;

      res.cookie("emailForVerify", email, USER_EMAIL_VERIFY_COOKIE_OPTIONS);

      await passwordService.resetPassword({ email });

      res.status(200).json({
        status: "success",
        message: "Reset password link sent to the email",
      });
    },
  ),

  setNewPassword: catchAsync(
    async (
      req: Request<SetNewPasswordParams, {}, CreatePasswordInput>,
      res: Response,
    ) => {
      const { token } = req.params;
      const { password } = req.body;

      await passwordService.setNewPassword(password, token);

      // to make sure user logout after setting up new password
      clearTokenCookies(res);
      res.clearCookie("emailForVerify", USER_EMAIL_VERIFY_COOKIE_OPTIONS);

      res.status(200).json({
        status: "success",
        message:
          "New password successfully set to your account, please re-login",
      });
    },
  ),
};
