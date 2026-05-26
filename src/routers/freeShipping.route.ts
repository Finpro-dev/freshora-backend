import { Router } from "express";
import { freeShippingController } from "../controllers/freeShipping.controller";
import { authentication, authorization } from "../middlewares/auth.middleware";

const route = Router();

route.post(
  "/",
  authentication,
  authorization("CUSTOMER"),
  freeShippingController.retrieveUserFreeShipping,
);

export default route;
