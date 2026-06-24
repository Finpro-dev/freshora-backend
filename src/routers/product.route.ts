import { Router } from "express";
import { authentication, authorization } from "../middlewares/auth.middleware";
import { productController } from "../controllers/product.controller";
import { upload } from "../configs/multer.config";
import { multerErrorMiddleware } from "../middlewares/multerError.middleware";
import { productQuerySchema } from "../schemas/product.schema";
import { validate } from "../middlewares/validation.middleware";

const productRoute = Router();

productRoute.get(
  "/",
  validate(productQuerySchema),
  productController.getAllProducts,
);

productRoute.get("/:productId", productController.getProductById);
productRoute.get("/store/:storeId", productController.getProductByStoreId);

productRoute.get(
  "/store-products",
  authentication,
  authorization("SUPER_ADMIN", "STORE_ADMIN"),
  productController.getStoreProducts,
);

productRoute.post(
  "/create-product",
  authentication,
  authorization("SUPER_ADMIN"),
  upload.array("product-photos", 5),
  multerErrorMiddleware,
  productController.createProduct,
);

productRoute.delete(
  "/delete/:productId",
  authentication,
  authorization("SUPER_ADMIN"),
  productController.deleteProduct,
);

productRoute.put(
  "/update/:productId",
  authentication,
  authorization("SUPER_ADMIN"),
  upload.array("product-photos", 5),
  multerErrorMiddleware,
  productController.updateProduct,
);

export default productRoute;
