import { Router } from "express";
import { testingController } from "../controllers/testing.controller";
import { upload } from "../configs/multer.config";
import { multerErrorMiddleware } from "../middlewares/multerError.middleware";

const route = Router();

route.get("/email-testing", testingController.emailTesting);
route.post(
  "/upload-testing",
  upload.array("upload-multiple-testing", 2),
  multerErrorMiddleware,
  testingController.emailTesting,
);

export default route;
