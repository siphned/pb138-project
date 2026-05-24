<<<<<<< HEAD
import { StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
=======
import { Star } from "lucide-react";
>>>>>>> origin/main
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number; // 0–5
  reviewCount?: number; // optional, show "(N reviews)" if provided
  size?: "sm" | "md"; // 'sm' = h-3.5 w-3.5 (default), 'md' = h-4 w-4
  showNumeric?: boolean; // show numeric rating
}

export function StarRating({
  rating,
  reviewCount,
  size = "sm",
  showNumeric = true,
}: StarRatingProps) {
  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <div className={cn("flex items-center gap-1.5", size === "sm" ? "text-sm" : "text-base")}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
<<<<<<< HEAD
          <HugeiconsIcon
            className={cn(
              iconSize,
              star <= Math.floor(rating) ? "fill-primary text-primary" : "text-muted-foreground"
            )}
            icon={StarIcon}
=======
          <Star
            className={cn(
              iconSize,
              star <= Math.floor(rating) ? "fill-star text-star" : "text-muted-foreground"
            )}
>>>>>>> origin/main
            key={star}
          />
        ))}
      </div>
      {showNumeric && <span className="font-medium text-foreground">{rating.toFixed(1)}</span>}
      {reviewCount !== undefined && (
        <span className="text-muted-foreground">({reviewCount} reviews)</span>
      )}
    </div>
  );
}
