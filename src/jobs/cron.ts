import cron from "node-cron";
import { cronService } from "../services/cron.service";

// Runs every 5 minutes
const AUTO_CANCEL_SCHEDULE = "*/5 * * * *";
// Runs every hour
const AUTO_CONFIRM_SCHEDULE = "0 * * * *";

const autoCancelExpiredPayments = async () => {
  console.log("[CRON] Running auto-cancel expired payments...");
  try {
    const canceled = await cronService.autoCancelExpiredPayments();
    if (canceled > 0) {
      console.log(`[CRON] Canceled ${canceled} expired unpaid orders`);
    }
  } catch (error) {
    console.error("[CRON] Auto-cancel failed:", error);
  }
};

const autoConfirmExpiredOrders = async () => {
  console.log("[CRON] Running auto-confirm orders...");
  try {
    const confirmed = await cronService.autoConfirmExpiredOrders();
    if (confirmed > 0) {
      console.log(`[CRON] Confirmed ${confirmed} orders`);
    }
  } catch (error) {
    console.error("[CRON] Auto-confirm failed:", error);
  }
};

export const initCronJobs = () => {
  cron.schedule(AUTO_CANCEL_SCHEDULE, autoCancelExpiredPayments);
  cron.schedule(AUTO_CONFIRM_SCHEDULE, autoConfirmExpiredOrders);
  console.log("[CRON] Jobs initialized");
};