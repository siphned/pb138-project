import type { GetProductsByIdReviews200 } from "@/generated/types/GetProductsByIdReviews";
import { EntityReviewsSection } from "./EntityReviewsSection";

interface ProductReviewsSectionProps {
  reviewData?: GetProductsByIdReviews200;
  isLoading: boolean;
}

export function ProductReviewsSection({ reviewData, isLoading }: ProductReviewsSectionProps) {
  return (
    <EntityReviewsSection
      emptyMessage="Be the first to review this product."
      isLoading={isLoading}
      reviewData={reviewData}
      title="Customer Reviews"
    />
  );
}
