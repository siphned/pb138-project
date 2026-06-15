import { StarRating } from "@/routes/-components/StarRating";

interface ReviewsSummaryProps {
  averageRating: number;
  reviewCount: number;
}

export function ReviewsSummary({ averageRating, reviewCount }: ReviewsSummaryProps) {
  return <StarRating rating={averageRating} reviewCount={reviewCount} showNumeric size="md" />;
}
