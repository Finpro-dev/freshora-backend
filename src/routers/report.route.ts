import { Router } from "express";
import { authentication, authorization } from "../middlewares/auth.middleware";
import { reportController } from "../controllers/report.controller";
import { validate } from "../middlewares/validation.middleware";
import { salesReportSchema, stockReportSchema, stockDetailReportSchema } from "../schemas/report.schema";

const reportRoute = Router();

reportRoute.get(
  "/sales/monthly",
  authentication,
  authorization("SUPER_ADMIN", "STORE_ADMIN"),
  validate(salesReportSchema),
  reportController.getMonthlySalesReport,
);

reportRoute.get(
  "/sales/by-category",
  authentication,
  authorization("SUPER_ADMIN", "STORE_ADMIN"),
  validate(salesReportSchema),
  reportController.getMonthlySalesByCategory,
);

reportRoute.get(
  "/sales/by-product",
  authentication,
  authorization("SUPER_ADMIN", "STORE_ADMIN"),
  validate(salesReportSchema),
  reportController.getMonthlySalesByProduct,
);

reportRoute.get(
  "/stock/summary",
  authentication,
  authorization("SUPER_ADMIN", "STORE_ADMIN"),
  validate(stockReportSchema),
  reportController.getMonthlyStockSummary,
);

reportRoute.get(
  "/stock/detail",
  authentication,
  authorization("SUPER_ADMIN", "STORE_ADMIN"),
  validate(stockDetailReportSchema),
  reportController.getStockDetailReport,
);

export default reportRoute;