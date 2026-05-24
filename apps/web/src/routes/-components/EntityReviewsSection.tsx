import { ReviewList } from "@/components/reviews/ReviewList";
import { ReviewsSummary } from "@/components/reviews/ReviewsSummary";
import { useGetProductsByIdReviews } from "@/generated/hooks/useGetProductsByIdReviews";
import { useGetWinemakersByIdReviews } from "@/generated/hooks/useGetWinemakersByIdReviews";
import { useGetWinesByIdReviews } from "@/generated/hooks/useGetWinesByIdReviews";

interface EntityReviewsSectionProps {
  entityId?: string;
  entityType?: "wine" | "product" | "winemaker";
  // biome-ignore lint/suspicious/noExplicitAny: reviewData shapes vary by entity; unified narrowing pending BE consolidation
  reviewData?: any;
  isLoading?: boolean;
  title?: string;
  emptyMessage?: string;
}

export function EntityReviewsSection({
  entityId,
  entityType,
  reviewData: initialReviewData,
  isLoading: initialIsLoading,
  title = "Customer Reviews",
  emptyMessage = "Be the first to review.",
}: EntityReviewsSectionProps) {
  const wineQuery = useGetWinesByIdReviews(
    entityType === "wine" ? entityId : undefined,
    undefined,
    {
      query: { enabled: entityType === "wine" && !!entityId },
    }
  );
  const productQuery = useGetProductsByIdReviews(
    entityType === "product" ? entityId : undefined,
    undefined,
    {
      query: { enabled: entityType === "product" && !!entityId },
    }
  );
  const winemakerQuery = useGetWinemakersByIdReviews(
    entityType === "winemaker" ? entityId : undefined,
    undefined,
    {
      query: { enabled: entityType === "winemaker" && !!entityId },
    }
  );

  const reviewData =
    initialReviewData || wineQuery.data || productQuery.data || winemakerQuery.data;
  const isLoading =
    initialIsLoading ?? (wineQuery.isLoading || productQuery.isLoading || winemakerQuery.isLoading);

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold">{title}</h2>

      {reviewData && reviewData.averageRating !== null && (
        <ReviewsSummary
          averageRating={reviewData.averageRating}
          reviewCount={reviewData.totalCount}
        />
      )}

      <ReviewList
        emptyMessage={emptyMessage}
        isLoading={isLoading}
        reviews={
          // biome-ignore lint/suspicious/noExplicitAny: review row shape varies per BE response (see reviewData prop comment)
          reviewData?.reviews.map((r: any) => ({
            authorName: `${r.user.fname} ${r.user.lname}`,
            body: r.body ?? "",
            createdAt: String(r.createdAt),
            id: r.id,
            rating: Number(r.rating),
          })) ?? []
        }
      />
    </div>
  );
}
