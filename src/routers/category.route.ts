import { Router } from "express";
import { categoryController } from "../controllers/category.controller";
import { authentication, authorization } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import { createCategorySchema } from "../schemas/category.schema";

const categoryRoute = Router();

categoryRoute.get("/", categoryController.getProductCategories);

categoryRoute.post("/", categoryController.createProductCategory);

categoryRoute.put(
  "/:productCategoryId",
  categoryController.updateProductCategories,
);

categoryRoute.delete(
  "/:productCategoryId",
  categoryController.deleteProductCategories,
);

export default categoryRoute;
