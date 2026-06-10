import { Request, Response } from "express";
import { cronService } from "../services/cron.service";

export const cronController = {
  autoConfirmOrders: async (_req: Request, res: Response) => {
    const confirmed = await cronService.autoConfirmExpiredOrders();

    res.status(200).json({
      success: true,
      message: `Auto-confirmed ${confirmed} orders`,
    });
  },

  autoCancelExpiredPayments: async (_req: Request, res: Response) => {
    const canceled = await cronService.autoCancelExpiredPayments();

    res.status(200).json({
      success: true,
      message: `Auto-canceled ${canceled} unpaid orders`,
    });
  },
};