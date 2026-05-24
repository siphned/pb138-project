<<<<<<< HEAD
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
import { useGetAdminReviews } from "@/generated/hooks/useGetAdminReviews";
=======
import { createFileRoute } from "@tanstack/react-router";
import { RouteStub } from "./-components/RouteStub";
>>>>>>> origin/main

export const Route = createFileRoute("/_authenticated/_admin/moderation")({
  component: ModerationPage,
});

function ModerationPage() {
<<<<<<< HEAD
  const { data, isLoading, error } = useGetAdminReviews();
  const queryClient = useQueryClient();
  const { mutate: deleteReview, isPending: isDeleting } = useDeleteAdminReviewsById();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [approvedReviews, setApprovedReviews] = useState<Set<string>>(new Set());

  // biome-ignore lint/suspicious/noExplicitAny: API response is untyped
  const reviews = (data as any)?.data || [];

  if (error) {
    return (
      <main className="mx-auto max-w-6xl space-y-4 p-6">
        <h1 className="text-2xl font-semibold">Content Moderation</h1>
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          <p>
            Failed to load moderation queue:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      </main>
    );
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton className="h-24 w-full" key={i} />
          ))}
        </div>
      );
    }

    if (reviews.length === 0) {
      return (
        <div className="rounded-md border border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">No reviews to moderate</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* biome-ignore lint/suspicious/noExplicitAny: API response is untyped */}
        {reviews.map((review: any) => (
          <div className="rounded-md border border-border bg-card p-4" key={review.id}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-medium">
                  {review.user?.fname || review.user?.lname
                    ? `${review.user.fname || ""} ${review.user.lname || ""}`.trim()
                    : "Anonymous"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {review.content || "No content"}
                </p>
                <p className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Rating: {review.rating}/5</span>
                  <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  disabled={approvedReviews.has(review.id)}
                  onClick={() => {
                    setApprovedReviews((prev) => new Set(prev).add(review.id));
                  }}
                  size="sm"
                  variant="outline"
                >
                  {approvedReviews.has(review.id) ? "Approved" : "Approve"}
                </Button>
                <Button
                  disabled={isDeleting}
                  onClick={() => setConfirmDelete(review.id)}
                  size="sm"
                  variant="destructive"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleConfirmDelete = (reviewId: string) => {
    deleteReview(
      { id: reviewId },
      {
        onSuccess: () => {
          setConfirmDelete(null);
          queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
        },
      }
    );
  };

  return (
    <main className="mx-auto max-w-6xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Content Moderation</h1>
      <p className="text-muted-foreground">
        Review flagged content and manage platform compliance.
      </p>

      {renderContent()}

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
              disabled={isDeleting}
              onClick={() => confirmDelete && handleConfirmDelete(confirmDelete)}
              variant="destructive"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
=======
  return <RouteStub title="Content Moderation" />;
>>>>>>> origin/main
}
