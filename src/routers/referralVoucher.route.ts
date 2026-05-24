import { Router } from "express";
import { referralVoucherController } from "../controllers/referralVoucher.controller";
import { authentication } from "../middlewares/auth.middleware";

const route = Router();

route.get(
  "/",
  authentication,
  referralVoucherController.getReferralVoucherDetails,
);

export default route;
