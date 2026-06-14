import { Skeleton } from "@/components/ui/skeleton";
import { ReviewCard } from "@/routes/-components/ReviewCard";

interface ReviewListProps {
  reviews: Array<{
    id: string;
    authorName: string;
    authorAvatarUrl?: string;
    rating: number;
    body: string;
    createdAt: string;
  }>;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function ReviewList({
  reviews,
  isLoading,
  emptyMessage = "No reviews yet.",
}: ReviewListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton className="h-24 w-full rounded-xl" key={i} />
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
