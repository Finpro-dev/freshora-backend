import { prisma } from "../configs/prisma.config";
import { SearchRecommendationInput } from "../schemas/searchRecommendation.schema";

export const searchRecommendationService = {
  getSearchRecommendation: async ({ search }: SearchRecommendationInput) => {
    if (!search?.trim()) return [];
    const searchFormatted = search.replace("-", " | "); // must be in form of e.g. this | is | novpa
    const limit = 5;
    const searchRecommendation = await prisma.product.findMany({
      where: {
        name: {
          search: searchFormatted,
        },
      },
      orderBy: {
        _relevance: {
          fields: ["name"],
          search: searchFormatted,
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
