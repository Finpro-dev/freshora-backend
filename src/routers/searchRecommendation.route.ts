import { Router } from "express";
import { validate } from "../middlewares/validation.middleware";
import { searchRecommendationSchema } from "../schemas/searchRecommendation.schema";
import { searchRecommendationController } from "../controllers/searchRecommendation.controller";

const route = Router();

route.get(
  "/",
  validate(searchRecommendationSchema),
  searchRecommendationController.getSearchRecommendation,
);

export default route;
