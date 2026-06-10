import { Router } from "express";
import { cronController } from "../controllers/cron.controller";

const route = Router();

route.post("/auto-confirm-orders", cronController.autoConfirmOrders);
route.post("/auto-cancel-expired-payments", cronController.autoCancelExpiredPayments);

export default route;