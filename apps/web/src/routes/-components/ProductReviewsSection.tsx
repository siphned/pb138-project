import type { GetReviewsProductById200 } from "@/generated/types/GetReviewsProductById";
import { EntityReviewsSection } from "./EntityReviewsSection";

interface ProductReviewsSectionProps {
  reviewData?: GetReviewsProductById200;
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
