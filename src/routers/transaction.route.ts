import { Router } from "express";
import { transactionController } from "../controllers/transaction.controller";
import { authentication, authorization } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import {
  cancelOrderSchema,
  confirmOrderSchema,
  createTransactionSchema,
} from "../schemas/createTransaction.schema";

const route = Router();

route.post(
  "/",
  authentication,
  authorization("CUSTOMER"),
  validate(createTransactionSchema),
  transactionController.createOrder,
);

route.delete(
  "/:transactionId",
  authentication,
  authorization("CUSTOMER"),
  validate(cancelOrderSchema),
  transactionController.cancelOrder,
);

route.put(
  "/:transactionId/confirm",
  authentication,
  authorization("CUSTOMER"),
  validate(confirmOrderSchema),
  transactionController.confirmOrder,
);

export default route;