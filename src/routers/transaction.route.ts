import { Router } from "express";
import { transactionController } from "../controllers/transaction.controller";
import { authentication, authorization } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import { createTransactionSchema } from "../schemas/createTransaction.schema";

const route = Router();

route.post(
  "/",
  authentication,
  authorization("CUSTOMER"),
  validate(createTransactionSchema),
  transactionController.createOrder,
);

export default route;
