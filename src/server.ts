import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express, { Express, Request, Response } from "express";
import { CORS_CONFIG } from "./configs/cors.config";
import {
  DATABASE_CREDENTIALS,
  SERVER_CREDENTIALS,
} from "./configs/dotenv.config";
import { upload } from "./configs/multer.config";
import { globalErrorHandler } from "./middlewares/globalError.middleware";
import { multerErrorMiddleware } from "./middlewares/multerError.middleware";
import { uploadMany } from "./utils/cloudinaryUploader.util";
import testingRoute from "./routers/testing.route";

const app: Express = express();

app.set("trust proxy", 1);

app.use(express.json());

// cookie-parser middleware
app.use(cookieParser());

// cors
app.use(cors(CORS_CONFIG));

// END-POINTS
// upload-testing
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

app.use("/api", testingRoute);

// globar error middleware
app.use(globalErrorHandler);

if (SERVER_CREDENTIALS.NODE_ENV !== "production") {
  const port = DATABASE_CREDENTIALS.PORT;
  app.listen(port, () => {
    console.log(
      `🦄 🌱 [server]: Server is running at http://localhost:${port}`,
    );
  });
}
