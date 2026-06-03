import { Router } from "express";
import { categoryController } from "../controllers/category.controller";

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
