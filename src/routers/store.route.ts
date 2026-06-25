import { Router } from "express";
import { authentication, authorization } from "../middlewares/auth.middleware";
import { storeController } from "../controllers/store.controller";
import { upload } from "../configs/multer.config";
import { validate } from "../middlewares/validation.middleware";
import { createStoreSchema } from "../schemas/createStore.schema";
import { editStoreSchma } from "../schemas/editStore.schema";
import { calculateNearestStore } from "../schemas/calculateNearestStore.schema";

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
  "/nearest",
  validate(calculateNearestStore),
  storeController.getNearestStore,
);

route.get(
  "/",
  authentication,
  authorization("SUPER_ADMIN", "STORE_ADMIN"),
  storeController.getAllStore,
);

route.get("/:storeId", authentication, storeController.getStoreDetails);

route.get(
  "/me/primary-store",
  authentication,
  authorization("SUPER_ADMIN", "CUSTOMER"),
  storeController.getPrimaryStore,
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

route.patch(
  "/:storeId/set-primary",
  authentication,
  authorization("SUPER_ADMIN"),
  storeController.setPrimaryStore,
);

export default route;
