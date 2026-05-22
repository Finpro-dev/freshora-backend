import { Router } from "express";
import { authentication, authorization } from "../middlewares/auth.middleware";
import { productController } from "../controllers/product.controller";

const productRoute = Router();

productRoute.use(authentication);

productRoute.post(
  "/products",
  authorization("SUPER_ADMIN"),
  productController.createProduct,
);

export default productRoute;
