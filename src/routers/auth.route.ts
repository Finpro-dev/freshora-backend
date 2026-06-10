import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validate } from "../middlewares/validation.middleware";
import { signupSchema } from "../schemas/signup.schema";
import { createPasswordSchema } from "../schemas/createPassword.schema";
import { verificationRequestSchema } from "../schemas/verificationRequest.schema";
import { loginSchema } from "../schemas/login.schema";
import { authentication, authorization } from "../middlewares/auth.middleware";
import { passwordController } from "../controllers/password.controller";
import {
  resetPasswordSchema,
  setNewPasswordSchema,
} from "../schemas/resetPassword.schema";
import passport from "passport";
import { handleGoogleAuthSuccess } from "../controllers/authGoogle.controller";
import { CORS_CREDENTIALS } from "../configs/dotenv.config";

const route = Router();

route.post("/signup", validate(signupSchema), authController.signup);

route.post("/login", validate(loginSchema), authController.login);

route.post("/logout", authentication, authController.logout);

route.post("/refresh", authController.refresh);

route.post(
  "/verify-request",
  validate(verificationRequestSchema),
  authController.verifyRequest,
);

route.patch(
  "/create-password/:token",
  validate(createPasswordSchema),
  passwordController.createPassword,
);

route.post(
  "/reset-password-request",
  validate(resetPasswordSchema),
  passwordController.resetPassword,
);

route.patch(
  "/reset-password/:token",
  validate(setNewPasswordSchema),
  validate(createPasswordSchema),
  passwordController.setNewPassword,
);

// google o auth

// handle login
route.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

// catch the returned value
route.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${CORS_CREDENTIALS.FRONTEND_URL}/login`,
    session: false,
  }),
  handleGoogleAuthSuccess,
);

export default route;
