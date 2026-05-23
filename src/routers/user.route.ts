import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { authentication } from "../middlewares/auth.middleware";

const route = Router();

route.get("/details", authentication, userController.getProfile);

export default route;
