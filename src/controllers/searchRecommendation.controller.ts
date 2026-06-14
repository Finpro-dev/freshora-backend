import { Request, Response } from "express";
import { searchRecommendationService } from "../services/searchRecommendation.service";
import { catchAsync } from "../utils/catchAsync.util";

export const searchRecommendationController = {
  getSearchRecommendation: catchAsync(
    async (req: Request<{}, {}, {}>, res: Response) => {
      const search = String(req.query.search);
      const searchRecommendations =
        await searchRecommendationService.getSearchRecommendation({ search });
      res.status(200).json({
        success: true,
        message: "Recommendation retrieved successfully",
        data: searchRecommendations,
      });
    },
  ),
};
