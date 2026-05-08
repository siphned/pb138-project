import { StarRating } from "@/components/catalog/StarRating";
import { Card } from "@/components/ui/card";

interface ReviewsSummaryProps {
  averageRating: number;
  reviewCount: number;
}

export function ReviewsSummary({ averageRating, reviewCount }: ReviewsSummaryProps) {
  return (
    <Card variant="section" className="items-center gap-2 py-8 text-center">
      <span className="font-heading text-5xl font-bold">{averageRating.toFixed(1)}</span>
      <StarRating rating={averageRating} showNumeric={false} size="md" />
      <span className="text-sm text-muted-foreground">{reviewCount} reviews</span>
    </Card>
  );
}
