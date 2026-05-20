import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validate } from "../controllers/validation.middleware";
import { signupSchema } from "../schemas/signup.schema";
import { createPasswordSchema } from "../schemas/createPassword.schema";

const route = Router();

route.post("/signup", validate(signupSchema), authController.signup);
route.post(
  "/create-password",
  validate(createPasswordSchema),
  authController.createPassword,
);

export default route;
