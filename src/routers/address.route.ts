import { Router } from "express";
import { addressController } from "../controllers/address.controller";
import { authentication, authorization } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import { createAddressSchema } from "../schemas/createAddress.schema";

const route = Router();

route.post(
  "/",
  authentication,
  validate(createAddressSchema),
  addressController.createAddress,
);

export default route;
