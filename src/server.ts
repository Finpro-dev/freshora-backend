import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express, { Express } from "express";
import passport from "passport";
import { CORS_CONFIG } from "./configs/cors.config";
import { DATABASE_CREDENTIALS } from "./configs/dotenv.config";
import { configureGooglePassport } from "./configs/passport.config";
import { initCronJobs } from "./jobs/cron";
import { globalErrorHandler } from "./middlewares/globalError.middleware";
import addressRoute from "./routers/address.route";
import adminRoute from "./routers/admin.route";
import adminOrderRoute from "./routers/adminOrder.route";
import authRoute from "./routers/auth.route";
import mutationRoute from "./routers/mutation.route";
import cartRoute from "./routers/cart.route";
import freeShippingRoute from "./routers/freeShipping.route";
import locationRoute from "./routers/location.route";
import paymentRoute from "./routers/payment.route";
import productRoute from "./routers/product.route";
import referralCouponRoute from "./routers/referralVoucher.route";
import searchRecommendationRoute from "./routers/searchRecommendation.route";
import shippingRoute from "./routers/shipping.route";
import storeRoute from "./routers/store.route";
import transactionRoute from "./routers/transaction.route";
import categoryRoute from "./routers/category.route";
import userRoute from "./routers/user.route";

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

//admin order router
app.use("/api/admin/orders", adminOrderRoute);

//mutation router
app.use("/api/mutations", mutationRoute);

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

// search recommendation
app.use("/api/search-recommendations", searchRecommendationRoute);

// product category
app.use("/api/product-categories", categoryRoute);

// global error middleware
app.use(globalErrorHandler);

const port = DATABASE_CREDENTIALS.PORT;
app.listen(port, () => {
  console.log(`🦄 🌱 [server]: Server is running at http://localhost:${port}`);

  // Initialize cron jobs
  initCronJobs();
});

export default app;
