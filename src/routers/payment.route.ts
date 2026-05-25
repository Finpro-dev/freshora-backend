import { Router } from "express";
import { paymentController } from "../controllers/payment.controller";

const route = Router();

route.post("/", paymentController.createPayment);
route.post("/webhook", paymentController.updatePaymentStatusWebhook);

export default route;
