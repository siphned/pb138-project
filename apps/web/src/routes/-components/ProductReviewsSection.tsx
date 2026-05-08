import { ReviewList } from "@/components/reviews/ReviewList";
import { ReviewsSummary } from "@/components/reviews/ReviewsSummary";
import type { GetProductsByIdReviews200 } from "@/generated/types/GetProductsByIdReviews";

interface ProductReviewsSectionProps {
  reviewData?: GetProductsByIdReviews200;
  isLoading: boolean;
}

export function ProductReviewsSection({ reviewData, isLoading }: ProductReviewsSectionProps) {
  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold">Customer Reviews</h2>

      {reviewData && reviewData.averageRating !== null && (
        <ReviewsSummary
          averageRating={reviewData.averageRating}
          reviewCount={reviewData.reviews.length}
        />
      )}

      <ReviewList
        emptyMessage="Be the first to review this product."
        isLoading={isLoading}
        reviews={
          reviewData?.reviews.map((r: GetProductsByIdReviews200["reviews"][number]) => ({
            authorName: `${r.user.fname} ${r.user.lname}`,
            body: r.body ?? "",
            createdAt: r.createdAt as unknown as string,
            id: r.id,
            rating: r.rating as unknown as number,
          })) ?? []
        }
      />
    </div>
  );
}
