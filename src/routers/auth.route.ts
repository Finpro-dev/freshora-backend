import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validate } from "../controllers/validation.middleware";
import { signupSchema } from "../schemas/signup.schema";

const route = Router();

route.post("/signup", validate(signupSchema), authController.signup);

export default route;
