import { prisma } from "../configs/prisma.config";
import { SearchRecommendationInput } from "../schemas/searchRecommendation.schema";

export const searchRecommendationService = {
  getSearchRecommendation: async ({ search }: SearchRecommendationInput) => {
    if (!search?.trim()) return;

    const limit = 10;
    const searchRecommendation = await prisma.product.findMany({
      orderBy: {
        _relevance: {
          fields: ["name", "description"],
          search: String(search),
          sort: "desc",
        },
      },
      select: {
        name: true,
        productId: true,
        slug: true,
      },
      take: limit,
    });

    return searchRecommendation || [];
  },
};
