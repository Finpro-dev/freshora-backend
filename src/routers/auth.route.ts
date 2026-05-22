import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validate } from "../controllers/validation.middleware";
import { signupSchema } from "../schemas/signup.schema";
import { createPasswordSchema } from "../schemas/createPassword.schema";
import { verificationRequestSchema } from "../schemas/verificationRequest.schema";
import { loginSchema } from "../schemas/login.schema";
import { authentication, authorization } from "../middlewares/auth.middleware";

const route = Router();

route.post("/signup", validate(signupSchema), authController.signup);

route.post("/login", validate(loginSchema), authController.login);

route.post(
  "/logout",
  authentication,
  authorization("SUPER_ADMIN"),
  authController.logout,
);

route.post("/refresh", authController.refresh);

route.post(
  "/create-password",
  validate(createPasswordSchema),
  authController.createPassword,
);

route.get(
  "/verify-request",
  validate(verificationRequestSchema),
  authController.verifyRequest,
);

export default route;
