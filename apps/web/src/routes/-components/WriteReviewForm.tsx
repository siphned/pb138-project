import { StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context";
import { usePostProductsByIdReviews } from "@/generated/hooks/usePostProductsByIdReviews";
import { usePostWinemakersByIdReviews } from "@/generated/hooks/usePostWinemakersByIdReviews";
import { cn } from "@/lib/utils";

export type ReviewableEntityType = "product" | "winemaker";

interface WriteReviewFormProps {
  entityType: ReviewableEntityType;
  entityId: string;
}

// Friendly copy for the eligibility errors the backend raises on submit. We don't
// know up front whether the user purchased the item, so we let the request fail
// and translate the error code rather than gating the form ahead of time.
const ERROR_MESSAGES: Record<string, string> = {
  ALREADY_REVIEWED: "You've already reviewed this.",
  NOT_PURCHASED: "You can write a review after you purchase this product.",
};

function errorMessage(error: unknown): string {
  const code = (error as { response?: { data?: { error?: { code?: string } } } })?.response?.data
    ?.error?.code;
  return (code && ERROR_MESSAGES[code]) || "Couldn't submit your review. Please try again.";
}

export function WriteReviewForm({ entityType, entityId }: WriteReviewFormProps) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [body, setBody] = useState("");

  const onSuccess = () => {
    // Reviews are cached per sort under this prefix; refresh them all so the new one shows.
    queryClient.invalidateQueries({ queryKey: ["reviews", entityType, entityId] });
    setRating(0);
    setHovered(0);
    setBody("");
  };

  // Both hooks must be called unconditionally; only one is used per entity type.
  const productMutation = usePostProductsByIdReviews({ mutation: { onSuccess } });
  const winemakerMutation = usePostWinemakersByIdReviews({ mutation: { onSuccess } });
  const mutation = entityType === "product" ? productMutation : winemakerMutation;

  if (!user) return null;

  const submit = () => {
    if (rating < 1) return;
    mutation.mutate({ data: { body: body.trim() || undefined, rating }, id: entityId });
  };

  const shownRating = hovered || rating;

  return (
    <form
      className="space-y-3 rounded-lg border border-border p-4"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <p className="font-medium text-foreground">Write a review</p>

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            aria-pressed={rating === star}
            className="rounded p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            type="button"
          >
            <HugeiconsIcon
              className={cn(
                "h-6 w-6",
                star <= shownRating ? "fill-primary text-primary" : "text-muted-foreground"
              )}
              icon={StarIcon}
            />
          </button>
        ))}
      </div>

      <Textarea
        maxLength={2000}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Share your experience (optional)"
        value={body}
      />

      {mutation.isError && (
        <p className="text-sm text-destructive">{errorMessage(mutation.error)}</p>
      )}
      {mutation.isSuccess && (
        <p className="text-sm text-success">Thanks! Your review was posted.</p>
      )}

      <Button disabled={rating < 1 || mutation.isPending} type="submit">
        {mutation.isPending ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}
