import midtransClient from "midtrans-client";
import { PAYMENT_GATEWAY } from "./dotenv.config";

export let snap = new midtransClient.Snap({
  clientKey: PAYMENT_GATEWAY.CLIENT_KEY!,
  isProduction: false,
  serverKey: PAYMENT_GATEWAY.SERVER_KEY!,
});
