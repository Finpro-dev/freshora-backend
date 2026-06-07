import { Router } from "express";
import { paymentController } from "../controllers/payment.controller";
import { validate } from "../middlewares/validation.middleware";
import { midtransWebhookSchema } from "../schemas/payment.schema";

const route = Router();

route.post(
  "/webhook",
  validate(midtransWebhookSchema),
  paymentController.webhookMidtrans,
);

export default route;