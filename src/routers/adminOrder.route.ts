import { Router } from "express";
import { adminOrderController } from "../controllers/adminOrder.controller";
import { authentication, authorization } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import {
  adminOrderListSchema,
  adminUpdateOrderStatusSchema,
  adminCancelOrderSchema,
  adminOrderDetailSchema,
} from "../schemas/adminOrder.schema";

const router = Router();

router.use(authentication);
router.use(authorization("SUPER_ADMIN", "STORE_ADMIN"));

router.get(
  "/stats",
  adminOrderController.getOrderStats
);

router.get(
  "/",
  validate(adminOrderListSchema),
  adminOrderController.getAllOrders
);

router.get(
  "/:transactionId",
  validate(adminOrderDetailSchema),
  adminOrderController.getOrderDetail
);

router.patch(
  "/:transactionId/status",
  validate(adminUpdateOrderStatusSchema),
  adminOrderController.updateOrderToShipping
);

router.patch(
  "/:transactionId/cancel",
  validate(adminCancelOrderSchema),
  adminOrderController.cancelOrder
);

export default router;