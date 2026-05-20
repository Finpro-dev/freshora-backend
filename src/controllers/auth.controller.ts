import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.util";
import { authServices } from "../services/auth.service";
import { emailService } from "../services/email.service";

export const authController = {
  signup: catchAsync(async (req: Request, res: Response) => {
    const newUser = await authServices.signup(req.body);

    const fullName = newUser.fullName;
    const email = newUser.email;
    const token = newUser.token;

    await emailService.sendVerificationEmail(fullName, email, token);

    res.status(201).json({
      status: "success",
      message: "User successfully created",
    });
  }),
};
