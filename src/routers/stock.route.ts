import { Router } from "express";
import { stockController } from "../controllers/stock.controller";
import { validate } from "../middlewares/validation.middleware";
import { updateStockSchema } from "../schemas/stock.schema";
import { authentication, authorization } from "../middlewares/auth.middleware";

const stockRouter = Router();

// 1. Sinkron dengan useGetStocks(storeId) -> GET /admin/stocks
stockRouter.get(
  "/",
  authentication,
  authorization("STORE_ADMIN", "SUPER_ADMIN"),
  stockController.getStocks,
);

// 2. Sinkron dengan useGetStockJournals(storeId) -> GET /admin/stocks/journals
// CATATAN: Ini harus ditaruh DI ATAS route /:stockId agar kata "journals" tidak dianggap sebagai :stockId
stockRouter.get(
  "/journals",
  authentication,
  authorization("STORE_ADMIN", "SUPER_ADMIN"),
  stockController.getStockJournals,
);

// 3. Sinkron dengan useGetStockById(stockId) -> GET /admin/stocks/:stockId
stockRouter.get(
  "/:stockId",
  authentication,
  authorization("STORE_ADMIN", "SUPER_ADMIN"),
  stockController.getStockById,
);

// 4. Sinkron dengan useUpdateStock() -> POST /admin/stocks/update
stockRouter.post(
  "/update",
  authentication,
  authorization("STORE_ADMIN", "SUPER_ADMIN"),
  validate(updateStockSchema),
  stockController.updateStock,
);

export default stockRouter;
