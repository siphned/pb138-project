import { StarRating } from "@/components/catalog/StarRating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

interface ReviewCardProps {
  review: {
    id: string;
    authorName: string;
    authorAvatarUrl?: string;
    rating: number;
    body: string;
    createdAt: string;
  };
}

export function ReviewCard({ review }: ReviewCardProps) {
  const initials = review.authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <Card className="rounded-xl border-none bg-secondary/10 p-4 shadow-none">
      <div className="flex gap-4">
        <Avatar className="h-8 w-8">
          <AvatarImage alt={review.authorName} src={review.authorAvatarUrl} />
          <AvatarFallback className="text-xs uppercase">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-medium">{review.authorName}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
          <StarRating rating={review.rating} showNumeric={false} size="sm" />
          <p className="mt-2 text-sm text-foreground/80">{review.body}</p>
        </div>
      </div>
    </Card>
  );
}
