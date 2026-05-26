import { Router } from "express";
import { authentication, authorization } from "../middlewares/auth.middleware";
import { storeController } from "../controllers/store.controller";
import { upload } from "../configs/multer.config";

const route = Router();

route.post(
  "/",
  authentication,
  authorization("SUPER_ADMIN"),
  upload.single("avatar"),
  storeController.createStore,
);

export default route;
