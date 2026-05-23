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

const app: Express = express();

app.set("trust proxy", 1);

app.use(express.json());

// cookie-parser middleware
app.use(cookieParser());

// cors
app.use(cors(CORS_CONFIG));

// END-POINTS

// upload-testing
app.use("/api", testingRoute);

// auth end-point
app.use("/api/auth", authRoute);

// cart end-point
app.use("/api/cart", cartRoute);

// user end-point
app.use("/api/users", userRoute);

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
