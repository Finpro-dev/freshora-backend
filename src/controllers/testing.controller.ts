import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.util";
import { testingService } from "../services/testing.service";

export const testingController = {
  emailTesting: catchAsync(async (req: Request, res: Response) => {
    await testingService.emailTesting();
    res.status(200).json({
      status: "successfull",
      message: "email sent",
    });
  }),

  uploadTesting: catchAsync(async (req: Request, res: Response) => {
    const urls = await testingService.uploadTesting(
      req.files as Express.Multer.File[],
    );

    res.status(200).json({
      status: "success",
      urls,
      message: "testing successfull",
    });
  }),
};
