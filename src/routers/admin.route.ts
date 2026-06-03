import { Router } from "express";
import { adminController } from "../controllers/admin.controller";
import { authorization, authentication } from "../middlewares/auth.middleware";
import categoryRoute from "./category.route";

const adminRoute = Router();

// Apply authentication middleware first
adminRoute.use(authentication, authorization("SUPER_ADMIN"));

// GET /api/admin/users - Get all users (SUPER_ADMIN only)
adminRoute.get("/users", adminController.getUsers);

adminRoute.patch("/store-admin/:adminId", adminController.updateStoreAdmin);

adminRoute.post("/store-admin", adminController.createStoreAdmin);

adminRoute.delete("/store-admin/:adminId", adminController.deleteStoreAdmin);

adminRoute.use("/categories", categoryRoute);

export default adminRoute;
