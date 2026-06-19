import { Router } from "express";
import { categoryController } from "../controllers/category.controller";
import { authentication, authorization } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import { createCategorySchema } from "../schemas/category.schema";

const categoryRoute = Router();

categoryRoute.get("/", categoryController.getProductCategories);

categoryRoute.post(
  "/",
  authentication,
  authorization("SUPER_ADMIN"),
  validate(createCategorySchema),
  categoryController.createProductCategory,
);

categoryRoute.put(
  "/:productCategoryId",
  authentication,
  authorization("SUPER_ADMIN"),
  categoryController.updateProductCategories,
);

categoryRoute.delete(
  "/:productCategoryId",
  authentication,
  authorization("SUPER_ADMIN"),
  categoryController.deleteProductCategories,
);

export default categoryRoute;
