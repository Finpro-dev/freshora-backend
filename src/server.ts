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
import testingRoute from "./routers/testing.route";
import authRoute from "./routers/auth.route";
import cartRoute from "./routers/cart.route";
import userRoute from "./routers/user.route";
import referralCouponRoute from "./routers/referralVoucher.route";
import addressRoute from "./routers/address.route";
import paymentRoute from "./routers/payment.route";
import shippingRoute from "./routers/shipping.route";
import locationRoute from "./routers/location.route";

const app: Express = express();

app.set("trust proxy", 1);

app.use(express.json());

// cookie-parser middleware
app.use(cookieParser());

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

// cors
app.use(cors(CORS_CONFIG));

// END-POINTS

// auth end-point
app.use("/api/auth", authRoute);

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

// globar error middleware
app.use(globalErrorHandler);

if (SERVER_CREDENTIALS.NODE_ENV !== "production") {
  const port = DATABASE_CREDENTIALS.PORT;
  app.listen(port, () => {
    console.log(
      `🦄 🌱 [server]: Server is running at http://localhost:${port}`,
    );
  });
}
