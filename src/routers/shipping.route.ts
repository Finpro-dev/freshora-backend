import { Router } from "express";
import { shippingController } from "../controllers/shipping.controller";

const route = Router();

route.post("/", shippingController.calculateShippingCost);

export default route;
