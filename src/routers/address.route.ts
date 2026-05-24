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

route.get("/", authentication, addressController.getAllUserAddresses);

route.get("/:addressId", authentication, addressController.getAddressDetails);

route.patch(
  "/:addressId",
  authentication,
  authorization("CUSTOMER"),
  addressController.editAddressDetails,
);

route.delete(
  "/:addressId",
  authentication,
  authorization("CUSTOMER"),
  addressController.deleteUserAddress,
);

export default route;
