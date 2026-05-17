import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express, { Express, Request, Response } from "express";
import { CORS_CONFIG } from "./configs/cors.config";
import { DATABASE_CREDENTIALS } from "./configs/dotenv.config";
import { globalErrorHandler } from "./middlewares/error.middleware";
import { upload } from "./configs/multer.config";
import { uploadMany, uploadSingle } from "./utils/cloudinaryUploader.util";
import { multerErrorMiddleware } from "./middlewares/multerError.middleware";

const port = DATABASE_CREDENTIALS.PORT;
const app: Express = express();
app.use(express.json());

// cookie-parser middleware
app.use(cookieParser());

// cors
app.use(cors(CORS_CONFIG));

// END-POINTS
app.post(
  "/api/upload-testing",
  upload.array("upload-multiple-testing", 2),
  multerErrorMiddleware,
  async (req: Request, res: Response) => {
    const uploadedFiles = req.files as Express.Multer.File[];

    const urls = await uploadMany(uploadedFiles, "upload-multiple-testing");
    res.status(200).json({
      status: "success",
      urls,
      message: "testing successfull",
    });
  },
);

// globar error middleware
app.use(globalErrorHandler);

app.listen(port, () => {
  console.log(`🦄 🌱 [server]: Server is running at http://localhost:${port}`);
});
