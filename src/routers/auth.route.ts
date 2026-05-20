import { Router } from "express";
import { authController } from "../controllers/auth.controller";

const route = Router();

route.post("/signup", authController.signup);

export default route;
