import { Router } from "express";
import { adminController } from "../controllers/admin.controller";
import { authorization, authentication } from "../middlewares/auth.middleware";
import categoryRoute from "./category.route";
import discountRoute from "./discount.route";
import { validate } from "../middlewares/validation.middleware";
import { getUsersSchema } from "../schemas/admin.schema";

const adminRoute = Router();

// Apply authentication middleware first
adminRoute.use(authentication, authorization("SUPER_ADMIN"));

// GET /api/admin/users - Get all users (SUPER_ADMIN only)
adminRoute.get("/users", adminController.getUsers);

adminRoute.get("/users/:userId", adminController.getUserById);

adminRoute.patch("/store-admin/:adminId", adminController.updateStoreAdmin);

adminRoute.post("/store-admin", adminController.createStoreAdmin);

adminRoute.delete("/store-admin/:adminId", adminController.deleteStoreAdmin);

adminRoute.use("/categories", categoryRoute);

adminRoute.use("/discounts", discountRoute);

export default adminRoute;
