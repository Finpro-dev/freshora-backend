import { Router } from "express";
import { discountController } from "../controllers/discount.controller";

const discountRoute = Router();
discountRoute.get("/", discountController.getDiscount);
discountRoute.post("/create-discount", discountController.createDiscount);
discountRoute.delete(
  "/delete-discount/:discountId",
  discountController.deleteDiscount,
);

export default discountRoute;
