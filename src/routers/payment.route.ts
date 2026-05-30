import { Router } from "express";
import { paymentController } from "../controllers/payment.controller";

const route = Router();

route.post("/webhook", paymentController.webhookMidtrans);

export default route;
