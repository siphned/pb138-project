import { StarRating } from "@/components/catalog/StarRating";
<<<<<<< HEAD
import { Card } from "@/components/ui/card";
=======
>>>>>>> origin/main

interface ReviewsSummaryProps {
  averageRating: number;
  reviewCount: number;
}

export function ReviewsSummary({ averageRating, reviewCount }: ReviewsSummaryProps) {
  return (
<<<<<<< HEAD
    <Card className="items-center gap-2 py-8 text-center" variant="section">
      <span className="font-heading text-5xl font-bold">{averageRating.toFixed(1)}</span>
      <StarRating rating={averageRating} showNumeric={false} size="md" />
      <span className="text-sm text-muted-foreground">{reviewCount} reviews</span>
    </Card>
=======
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-secondary/10 py-8 text-center">
      <span className="font-heading text-5xl font-bold">{averageRating.toFixed(1)}</span>
      <StarRating rating={averageRating} showNumeric={false} size="md" />
      <span className="text-sm text-muted-foreground">{reviewCount} reviews</span>
    </div>
>>>>>>> origin/main
  );
}
