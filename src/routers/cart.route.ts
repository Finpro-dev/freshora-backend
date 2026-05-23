import { Router } from "express";
import { cartController } from "../controllers/cart.controller";
import { validate } from "../controllers/validation.middleware";
import { addToCartSchema, updateCartSchema } from "../schemas/cart.schema";
import { authentication, authorization } from "../middlewares/auth.middleware";

const route = Router();

route.use(authentication, authorization("CUSTOMER"));

route.get(
  "/",
  cartController.getAllCart,
);

route.post(
  "/items",
  validate(addToCartSchema),
  cartController.addToCart,
);

route.put(
  "/items/:cartItemId",
  validate(updateCartSchema),
  cartController.updateCartItem,
);

route.delete(
  "/items/:cartItemId",
  cartController.removeCartItem,
);

route.get(
  "/count",
  cartController.getCartCount,
);

export default route;
