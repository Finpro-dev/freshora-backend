import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authentication, authorization } from "../middlewares/auth.middleware";
import { upload } from "../configs/multer.config";
import { multerErrorMiddleware } from "../middlewares/multerError.middleware";
import { validate } from "../middlewares/validation.middleware";
import { updateUserProfileSchema } from "../schemas/updateUserProfile.schema";

const route = Router();

route.get("/me", authentication, userController.getProfile);

route.patch(
  "/me",
  authentication,
  validate(updateUserProfileSchema),
  upload.single("avatar"),
  multerErrorMiddleware,
  userController.updateProfile,
);

route.patch("/verify-email/:token", userController.verifyEmail);

route.get(
  "/store-admin/unassigned",
  authentication,
  // authorization("SUPER_ADMIN"),
  userController.getAllUnassignUsers,
);
export default route;
