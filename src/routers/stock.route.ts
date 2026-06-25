import { Router } from "express";
import { stockController } from "../controllers/stock.controller";
import { validate } from "../middlewares/validation.middleware";
import { updateStockSchema } from "../schemas/stock.schema";
import { authentication, authorization } from "../middlewares/auth.middleware";

const stockRouter = Router();

stockRouter.get(
  "/",
  authentication,
  authorization("STORE_ADMIN", "SUPER_ADMIN"),
  stockController.getStocks,
);

stockRouter.get(
  "/journals",
  authentication,
  authorization("STORE_ADMIN", "SUPER_ADMIN"),
  stockController.getStockJournals,
);

stockRouter.get(
  "/:stockId",
  authentication,
  authorization("STORE_ADMIN", "SUPER_ADMIN"),
  stockController.getStockById,
);

stockRouter.post(
  "/update",
  authentication,
  authorization("STORE_ADMIN", "SUPER_ADMIN"),
  validate(updateStockSchema),
  stockController.updateStock,
);

export default stockRouter;
