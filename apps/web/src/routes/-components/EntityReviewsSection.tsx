import { ReviewList } from "@/components/reviews/ReviewList";
import { ReviewsSummary } from "@/components/reviews/ReviewsSummary";

interface EntityReviewsSectionProps {
  reviewData?: {
    averageRating: number | null;
    reviews: Array<{
      id: string;
      body: string | null;
      rating: number;
      createdAt: string | Date;
      user: {
        id: string;
        fname: string;
        lname: string;
      };
    }>;
    totalCount: number;
  };
  isLoading: boolean;
  title?: string;
  emptyMessage?: string;
}

export function EntityReviewsSection({
  reviewData,
  isLoading,
  title = "Customer Reviews",
  emptyMessage = "Be the first to review.",
}: EntityReviewsSectionProps) {
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
          reviewData?.reviews.map((r) => ({
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
