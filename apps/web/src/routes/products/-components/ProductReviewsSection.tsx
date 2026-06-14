import { EntityReviewsSection } from "@/routes/-components/EntityReviewsSection";

interface ProductReviewsSectionProps {
  productId: string;
}

export function ProductReviewsSection({ productId }: ProductReviewsSectionProps) {
  return (
    <EntityReviewsSection
      emptyMessage="Be the first to review this product."
      entityId={productId}
      entityType="product"
      title="Customer Reviews"
    />
  );
}
