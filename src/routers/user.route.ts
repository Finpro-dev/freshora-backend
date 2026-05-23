import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authentication } from "../middlewares/auth.middleware";
import { upload } from "../configs/multer.config";
import { multerErrorMiddleware } from "../middlewares/multerError.middleware";

const route = Router();

route.get("/me", authentication, userController.getProfile);

route.patch(
  "/me",
  authentication,
  upload.single("avatar"),
  multerErrorMiddleware,
  userController.updateProfile,
);

export default route;
