import { Router } from "express";
import { authentication, authorization } from "../middlewares/auth.middleware";
import { productController } from "../controllers/product.controller";
import { upload } from "../configs/multer.config";
import { multerErrorMiddleware } from "../middlewares/multerError.middleware";

const productRoute = Router();

productRoute.use(authentication);

productRoute.post(
  "/create-product",
  authorization("SUPER_ADMIN"),
  upload.array("product-photos", 5),
  multerErrorMiddleware,
  productController.createProduct,
);

productRoute.delete(
  "/delete/:productId",
  authorization("SUPER_ADMIN"),
  productController.deleteProduct,
);

productRoute.put(
  "/update/:productId",
  authorization("SUPER_ADMIN"),
  upload.array("product-photos", 5),
  multerErrorMiddleware,
  productController.updateProduct,
);

export default productRoute;
