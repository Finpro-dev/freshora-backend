import { Router } from "express";
import { authentication, authorization } from "../middlewares/auth.middleware";
import { storeController } from "../controllers/store.controller";
import { upload } from "../configs/multer.config";
import { validate } from "../middlewares/validation.middleware";
import { createStoreSchema } from "../schemas/createStore.schema";
import { editStoreSchma } from "../schemas/editStore.schema";

const route = Router();

route.post(
  "/",
  authentication,
  authorization("SUPER_ADMIN"),
  upload.single("avatar"),
  validate(createStoreSchema),
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
  storeController.getStoreDetails,
);

route.delete(
  "/:storeId",
  authentication,
  authorization("SUPER_ADMIN"),
  storeController.deleteStore,
);

route.patch(
  "/:storeId",
  authentication,
  authorization("SUPER_ADMIN"),
  upload.single("avatar"),
  validate(editStoreSchma),
  storeController.editStore,
);

route.patch(
  "/:storeId/users",
  authentication,
  authorization("SUPER_ADMIN"),
  storeController.assignStoreAdmin,
);

export default route;
