import { useInfiniteQuery } from "@tanstack/react-query";
import { getProductsByIdReviews } from "@/generated/clients/getProductsByIdReviews";
import { getShopsByIdReviews } from "@/generated/clients/getShopsByIdReviews";
import { getWinemakersByIdReviews } from "@/generated/clients/getWinemakersByIdReviews";
import { getWinesByIdReviews } from "@/generated/clients/getWinesByIdReviews";

const PAGE_SIZE = 10;

export type ReviewSort = "newest" | "highest" | "lowest";
export type ReviewEntityType = "product" | "winemaker" | "wine" | "shop";

export interface EntityReview {
  id: string;
  body: string | null;
  rating: number;
  createdAt: string;
  user?: { fname: string | null; lname: string | null } | null;
}

interface ReviewsPage {
  reviews: EntityReview[];
  averageRating: number | null;
  totalCount: number;
}

type PageParams = { limit: number; page: number; sort: ReviewSort };

function fetchPage(
  entityType: ReviewEntityType,
  entityId: string,
  params: PageParams,
  signal: AbortSignal
): Promise<ReviewsPage> {
  const config = { signal };
  if (entityType === "winemaker") {
    return getWinemakersByIdReviews(entityId, params, config) as Promise<ReviewsPage>;
  }
  if (entityType === "wine") {
    return getWinesByIdReviews(entityId, params, config) as Promise<ReviewsPage>;
  }
  if (entityType === "shop") {
    return getShopsByIdReviews(entityId, params, config) as Promise<ReviewsPage>;
  }
  return getProductsByIdReviews(entityId, params, config) as Promise<ReviewsPage>;
}

export function entityReviewsQueryKey(
  entityType: ReviewEntityType,
  entityId: string | undefined,
  sort: ReviewSort
) {
  return ["reviews", entityType, entityId, sort, "infinite"] as const;
}

export function useEntityReviews(
  entityType: ReviewEntityType,
  entityId: string | undefined,
  sort: ReviewSort
) {
  return useInfiniteQuery({
    enabled: !!entityId,
    getNextPageParam: (lastPage: ReviewsPage, allPages: ReviewsPage[]) =>
      allPages.length * PAGE_SIZE < lastPage.totalCount ? allPages.length + 1 : undefined,
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }: { pageParam: number; signal: AbortSignal }) =>
      fetchPage(
        entityType,
        entityId as string,
        { limit: PAGE_SIZE, page: pageParam, sort },
        signal
      ),
    queryKey: entityReviewsQueryKey(entityType, entityId, sort),
  });
}
