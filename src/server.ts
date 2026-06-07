import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express, { Express } from "express";
import { CORS_CONFIG } from "./configs/cors.config";
import {
  DATABASE_CREDENTIALS,
  SERVER_CREDENTIALS,
} from "./configs/dotenv.config";
import { globalErrorHandler } from "./middlewares/globalError.middleware";
import addressRoute from "./routers/address.route";
import authRoute from "./routers/auth.route";
import adminRoute from "./routers/admin.route";
import productRoute from "./routers/product.route";
import cartRoute from "./routers/cart.route";
import freeShippingRoute from "./routers/freeShipping.route";
import locationRoute from "./routers/location.route";
import paymentRoute from "./routers/payment.route";
import referralCouponRoute from "./routers/referralVoucher.route";
import shippingRoute from "./routers/shipping.route";
import storeRoute from "./routers/store.route";
import userRoute from "./routers/user.route";
import transactionRoute from "./routers/transaction.route";
import { initCronJobs } from "./jobs/cron";
import passport from "passport";
import { configureGooglePassport } from "./configs/passport.config";

const app: Express = express();

app.set("trust proxy", 1);

app.use(express.json());

// cookie-parser middleware
app.use(cookieParser());

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

// cors
app.use(cors(CORS_CONFIG));

// google o-auth
app.use(passport.initialize());
configureGooglePassport();

// END-POINTS

// auth end-point
app.use("/api/auth", authRoute);

//admin router
app.use("/api/admin", adminRoute);

//product router
app.use("/api/products", productRoute);

// carts end-point
app.use("/api/cart", cartRoute);

// users end-point
app.use("/api/users", userRoute);

// referral-vouchers end-point
app.use("/api/profile/referral-vouchers", referralCouponRoute);

// addresses end-point
app.use("/api/addresses", addressRoute);

// payments
app.use("/api/payments", paymentRoute);

// shippings
app.use("/api/shipping/cost", shippingRoute);

// shippings
app.use("/api/location", locationRoute);

// shippings
app.use("/api/free-shipping-vouchers/user", freeShippingRoute);

// stores
app.use("/api/stores", storeRoute);

// transactions
app.use("/api/transactions", transactionRoute);

// Initialize cron jobs
initCronJobs();

// global error middleware
app.use(globalErrorHandler);

if (SERVER_CREDENTIALS.NODE_ENV !== "production") {
  const port = DATABASE_CREDENTIALS.PORT;
  app.listen(port, () => {
    console.log(
      `🦄 🌱 [server]: Server is running at http://localhost:${port}`,
    );
  });
}
