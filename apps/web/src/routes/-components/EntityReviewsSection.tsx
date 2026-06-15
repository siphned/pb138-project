import { useState } from "react";
import { InfiniteScrollArea } from "@/components/primitives/infinite-scroll-area";
import { Section } from "@/components/primitives/section";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReviewList } from "@/routes/-components/ReviewList";
import { ReviewsSummary } from "@/routes/-components/ReviewsSummary";
import {
  type ReviewEntityType,
  type ReviewSort,
  useEntityReviews,
} from "@/routes/-components/use-entity-reviews";

const SORT_LABELS: Record<ReviewSort, string> = {
  highest: "Highest rated",
  lowest: "Lowest rated",
  newest: "Newest",
};

type ReviewUser = { fname?: string | null; lname?: string | null } | null | undefined;

interface EntityReviewsSectionProps {
  entityId?: string;
  entityType: ReviewEntityType;
  title?: string;
  emptyMessage?: string;
}

function authorName(user: ReviewUser): string {
  const full = `${user?.fname?.trim() ?? ""} ${user?.lname?.trim() ?? ""}`.trim();
  return full || "Anonymous";
}

export function EntityReviewsSection({
  entityId,
  entityType,
  title = "Customer Reviews",
  emptyMessage = "Be the first to review.",
}: EntityReviewsSectionProps) {
  const [sort, setSort] = useState<ReviewSort>("newest");
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useEntityReviews(
    entityType,
    entityId,
    sort
  );

  const firstPage = data?.pages[0];
  const reviews = (data?.pages.flatMap((p) => p.reviews) ?? []).map((r) => ({
    authorName: authorName(r.user),
    body: r.body ?? "",
    createdAt: String(r.createdAt),
    id: r.id,
    rating: Number(r.rating),
  }));

  return (
    <Section heading={title}>
      {reviews.length > 0 && (
        <div className="flex items-center justify-between gap-4">
          {firstPage?.averageRating != null ? (
            <ReviewsSummary
              averageRating={firstPage.averageRating}
              reviewCount={firstPage.totalCount}
            />
          ) : (
            <span />
          )}
          <Select onValueChange={(value) => setSort(value as ReviewSort)} value={sort}>
            <SelectTrigger className="w-40" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(SORT_LABELS) as ReviewSort[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {SORT_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {isLoading || reviews.length === 0 ? (
        <ReviewList emptyMessage={emptyMessage} isLoading={isLoading} reviews={reviews} />
      ) : (
        <InfiniteScrollArea
          className="h-[28rem]"
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          itemCount={reviews.length}
        >
          <ReviewList reviews={reviews} />
        </InfiniteScrollArea>
      )}
    </Section>
  );
}
