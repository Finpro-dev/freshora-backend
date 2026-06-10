import { Router } from "express";
import { adminController } from "../controllers/admin.controller";
import { authorization, authentication } from "../middlewares/auth.middleware";

const adminRoute = Router();

// adminRoute.use(authentication); // Apply authentication middleware first
// adminRoute.use(authorization("SUPER_ADMIN"));

adminRoute.get("/users", adminController.getUsers);

export default adminRoute;
