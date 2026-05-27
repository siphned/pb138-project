import { Section } from "@/components/primitives/section";
import { ReviewList } from "@/components/reviews/ReviewList";
import { ReviewsSummary } from "@/components/reviews/ReviewsSummary";
import { useGetProductsByIdReviews } from "@/generated/hooks/useGetProductsByIdReviews";
import { useGetWinemakersByIdReviews } from "@/generated/hooks/useGetWinemakersByIdReviews";
import { useGetWinesByIdReviews } from "@/generated/hooks/useGetWinesByIdReviews";

type ReviewUser = { fname?: string | null; lname?: string | null } | null | undefined;

type RawReview = {
  id: string;
  body?: string | null;
  createdAt: string | number | Date;
  rating: number | string;
  user?: ReviewUser;
};

type ReviewSummaryPayload = {
  averageRating: number | null;
  totalCount: number;
  reviews?: RawReview[];
};

interface EntityReviewsSectionProps {
  entityId?: string;
  entityType?: "wine" | "product" | "winemaker";
  reviewData?: ReviewSummaryPayload | null;
  isLoading?: boolean;
  title?: string;
  emptyMessage?: string;
}

function authorName(user: ReviewUser): string {
  const first = user?.fname?.trim() ?? "";
  const last = user?.lname?.trim() ?? "";
  const full = `${first} ${last}`.trim();
  return full || "Anonymous";
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
    { query: { enabled: entityType === "wine" && !!entityId } }
  );
  const productQuery = useGetProductsByIdReviews(
    entityType === "product" ? entityId : undefined,
    undefined,
    { query: { enabled: entityType === "product" && !!entityId } }
  );
  const winemakerQuery = useGetWinemakersByIdReviews(
    entityType === "winemaker" ? entityId : undefined,
    undefined,
    { query: { enabled: entityType === "winemaker" && !!entityId } }
  );

  const remoteData = (wineQuery.data || productQuery.data || winemakerQuery.data) as
    | ReviewSummaryPayload
    | undefined;
  const reviewData = initialReviewData ?? remoteData ?? null;
  const isLoading =
    initialIsLoading ?? (wineQuery.isLoading || productQuery.isLoading || winemakerQuery.isLoading);

  const reviews = (reviewData?.reviews ?? []).map((r) => ({
    authorName: authorName(r.user),
    body: r.body ?? "",
    createdAt: String(r.createdAt),
    id: r.id,
    rating: Number(r.rating),
  }));

  return (
    <Section heading={title}>
      {reviewData && reviewData.averageRating !== null && (
        <ReviewsSummary
          averageRating={reviewData.averageRating}
          reviewCount={reviewData.totalCount}
        />
      )}

      <ReviewList emptyMessage={emptyMessage} isLoading={isLoading} reviews={reviews} />
    </Section>
  );
}
