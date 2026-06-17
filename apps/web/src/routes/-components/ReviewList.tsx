import { Skeleton } from "@/components/ui/skeleton";
import { ReviewCard } from "@/routes/-components/ReviewCard";
import type { ReviewEntityType } from "@/routes/-components/use-entity-reviews";

interface ReviewListProps {
  reviews: Array<{
    id: string;
    authorName: string;
    authorAvatarUrl?: string;
    rating: number;
    body: string;
    createdAt: string;
    userId: string;
    entityType?: string;
    entityId?: string;
  }>;
  isLoading?: boolean;
  emptyMessage?: string;
  entityType?: ReviewEntityType;
  entityId?: string;
}

export function ReviewList({
  reviews,
  isLoading,
  emptyMessage = "No reviews yet.",
  entityType,
  entityId,
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
        <ReviewCard entityId={entityId} entityType={entityType} key={review.id} review={review} />
      ))}
    </div>
  );
}
