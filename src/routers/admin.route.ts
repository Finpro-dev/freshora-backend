import { Router } from "express";
import { adminController } from "../controllers/admin.controller";
import { authorization, authentication } from "../middlewares/auth.middleware";
import categoryRoute from "./category.route";
import discountRoute from "./discount.route";
import { validate } from "../middlewares/validation.middleware";
import { getUsersSchema } from "../schemas/admin.schema";

const adminRoute = Router();

adminRoute.get(
  "/users",
  authentication,
  authorization("SUPER_ADMIN"),
  adminController.getUsers,
);

adminRoute.get(
  "/users/:userId",
  authentication,
  authorization("SUPER_ADMIN"),
  adminController.getUserById,
);

adminRoute.patch(
  "/store-admin/:adminId",
  authentication,
  authorization("SUPER_ADMIN"),
  adminController.updateStoreAdmin,
);

adminRoute.post(
  "/store-admin",
  authentication,
  authorization("SUPER_ADMIN"),
  adminController.createStoreAdmin,
);

adminRoute.delete(
  "/store-admin/:adminId",
  authentication,
  authorization("SUPER_ADMIN"),
  adminController.deleteStoreAdmin,
);

adminRoute.use(
  "/categories",
  authentication,
  authorization("SUPER_ADMIN"),
  categoryRoute,
);

adminRoute.use(
  "/discounts",
  authentication,
  authorization("STORE_ADMIN", "SUPER_ADMIN"),
  discountRoute,
);

export default adminRoute;
