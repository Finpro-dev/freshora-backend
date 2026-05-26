import { Router } from "express";
import { adminController } from "../controllers/admin.controller";
import { authorization, authentication } from "../middlewares/auth.middleware";

const adminRoute = Router();

// Apply authentication middleware first
adminRoute.use(authentication);

// GET /api/admin/users - Get all users (SUPER_ADMIN only)
adminRoute.get(
  "/users",
  authorization("SUPER_ADMIN"),
  adminController.getUsers,
);

export default adminRoute;
