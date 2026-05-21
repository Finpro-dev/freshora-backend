import { Router } from "express";
import { adminController } from "../controllers/admin.controller";
import { authentication } from "../middlewares/auth.middleware";
import { authorize } from "../middlewares/admin.auth.middleware";

const adminRoute = Router();

// Apply authentication middleware first
adminRoute.use(authentication);

// GET /api/admin/users - Get all users (SUPER_ADMIN only)
adminRoute.get("/users", authorize("SUPER_ADMIN"), adminController.getUsers);

export default adminRoute;
