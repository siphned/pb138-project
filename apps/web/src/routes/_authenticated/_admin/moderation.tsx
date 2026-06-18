import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteAdminReviewsById } from "@/generated/hooks/useDeleteAdminReviewsById";
import { getAdminReviewsQueryKey, useGetAdminReviews } from "@/generated/hooks/useGetAdminReviews";
import { usePostAdminReviewsByIdUnflag } from "@/generated/hooks/usePostAdminReviewsByIdUnflag";

export const Route = createFileRoute("/_authenticated/_admin/moderation")({
  component: ModerationPage,
});

function entityLink(entityType: string, entityId: string): string {
  if (entityType === "product") return `/products/${entityId}`;
  if (entityType === "winemaker") return `/winemakers/${entityId}`;
  if (entityType === "wine") return `/wines/${entityId}`;
  return "#";
}

function entityLabel(entityType: string): string {
  if (entityType === "product") return "Product";
  if (entityType === "winemaker") return "Winemaker";
  if (entityType === "wine") return "Wine";
  return entityType;
}

function ModerationPage() {
  const { data, isLoading, error } = useGetAdminReviews();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getAdminReviewsQueryKey() });

  const deleteMutation = useDeleteAdminReviewsById({
    mutation: {
      onError: () => toast.error("Failed to delete review"),
      onSuccess: () => {
        setConfirmDelete(null);
        invalidate();
        toast.success("Review deleted");
      },
    },
  });

  const unflagMutation = usePostAdminReviewsByIdUnflag({
    mutation: {
      onError: () => toast.error("Failed to approve review"),
      onSuccess: () => {
        invalidate();
        toast.success("Review approved — flag removed");
      },
    },
  });

  // biome-ignore lint/suspicious/noExplicitAny: API response is untyped
  const reviews = (data as any)?.data ?? [];

  if (error) {
    return (
      <main className="mx-auto max-w-4xl space-y-4 p-6">
        <h1 className="text-2xl font-semibold">Content Moderation</h1>
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          Failed to load moderation queue:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Content Moderation</h1>
        <p className="text-sm text-muted-foreground">
          Flagged reviews awaiting review. Approve to dismiss the flag, or delete to remove the
          review permanently.
        </p>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton className="h-28 w-full" key={i} />
          ))}
        </div>
      )}

      {!isLoading && reviews.length === 0 && (
        <div className="rounded-md border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">No flagged reviews — queue is clear</p>
        </div>
      )}

      {!isLoading && reviews.length > 0 && (
        <div className="space-y-3">
          {/* biome-ignore lint/suspicious/noExplicitAny: API response is untyped */}
          {reviews.map((review: any) => {
            const authorName =
              review.user?.fname || review.user?.lname
                ? `${review.user.fname ?? ""} ${review.user.lname ?? ""}`.trim()
                : "Anonymous";
            const link = entityLink(review.entityType, review.entityId);
            const label = entityLabel(review.entityType);

            return (
              <div
                className="rounded-lg border border-border bg-card p-4 space-y-3"
                key={review.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{authorName}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">
                        Rating: {review.rating}/5
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-foreground/80 line-clamp-3">
                      {review.body || <span className="italic text-muted-foreground">No text</span>}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      disabled={unflagMutation.isPending}
                      onClick={() => unflagMutation.mutate({ id: review.id })}
                      size="sm"
                      variant="outline"
                    >
                      Approve
                    </Button>
                    <Button
                      disabled={deleteMutation.isPending}
                      onClick={() => setConfirmDelete(review.id)}
                      size="sm"
                      variant="destructive"
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <Link
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  to={link as never}
                >
                  View on {label} page →
                </Link>
              </div>
            );
          })}
        </div>
      )}

      <Dialog
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        open={confirmDelete !== null}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Review?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The review will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setConfirmDelete(null)} variant="outline">
              Cancel
            </Button>
            <Button
              disabled={deleteMutation.isPending}
              onClick={() => confirmDelete && deleteMutation.mutate({ id: confirmDelete })}
              variant="destructive"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
