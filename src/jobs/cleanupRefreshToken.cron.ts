import cron from "node-cron";
import { refreshTokenService } from "../services/refreshToken.service";

export const cleanupRefreshTokenCron = () => {
  cron.schedule("*/5 * * * *", async () => {
    console.log("[CRON] Checking for expired refresh token...");

    try {
      const count = (await refreshTokenService.removeRefreshToken()) || 0;
      if (count > 0)
        console.log(`[CRON] Successfully deleted ${count} refresh tokens.`);
    } catch (error) {
      console.error("[CRON] Error during auto-delete:", error);
    }
  });

  console.log("💳 [Refresh-Token-Cron-Job] Initialized");
};
