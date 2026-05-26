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

route.get(
  "/",
  authentication,
  authorization("SUPER_ADMIN", "STORE_ADMIN"),
  storeController.getAllStore,
);

route.get(
  "/:storeId",
  authentication,
  authorization("SUPER_ADMIN"),
  storeController.getAllStore,
);

export default route;
