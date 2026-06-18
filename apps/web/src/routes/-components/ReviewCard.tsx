import { Delete01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUser } from "@/context/UserContext";
import { useDeleteReviewsById } from "@/generated/hooks/useDeleteReviewsById";
import { StarRating } from "@/routes/-components/StarRating";
import type { ReviewEntityType } from "@/routes/-components/use-entity-reviews";
import { Role } from "@/types/roles";

// The delete endpoint only accepts these entity types (shop reviews are not real).
type DeletableEntityType = "product" | "winemaker" | "wine";

const DELETABLE_ENTITY_TYPES = ["product", "winemaker", "wine"] as const;

function isDeletableEntityType(value: string | undefined): value is DeletableEntityType {
  return (DELETABLE_ENTITY_TYPES as readonly string[]).includes(value ?? "");
}

interface ReviewCardProps {
  review: {
    id: string;
    authorName: string;
    authorAvatarUrl?: string;
    rating: number;
    body: string;
    createdAt: string;
    userId: string;
    // The review's own entity. May differ from the section entity (e.g. the
    // shop page lists product reviews). Falls back to the section entity.
    entityType?: string;
    entityId?: string;
  };
  // The section's entity — used for cache invalidation of the visible list.
  entityType?: ReviewEntityType;
  entityId?: string;
}

export function ReviewCard({ review, entityType, entityId }: ReviewCardProps) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const deleteMutation = useDeleteReviewsById({
    mutation: {
      onSuccess: () => {
        setConfirmOpen(false);
        queryClient.invalidateQueries({ queryKey: ["reviews", entityType, entityId] });
      },
    },
  });

  const initials = review.authorName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  // Prefer the review's own entity (correct on aggregated lists like the shop
  // page); fall back to the section entity for the per-entity detail pages.
  const deleteEntityType = review.entityType ?? entityType;
  const deleteEntityId = review.entityId ?? entityId;
  const isDeletable = !!deleteEntityId && isDeletableEntityType(deleteEntityType);
  const canDelete =
    isDeletable && !!user && (user.id === review.userId || user.roles.includes(Role.admin));

  return (
    <Card className="rounded-xl border-none bg-secondary/10 p-4 shadow-none">
      <div className="flex gap-4">
        <Avatar className="h-8 w-8">
          <AvatarImage alt={review.authorName} src={review.authorAvatarUrl} />
          <AvatarFallback className="text-xs uppercase">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <span className="font-medium">{review.authorName}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString()}
              </span>
              {canDelete && (
                <Button
                  aria-label="Delete review"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => setConfirmOpen(true)}
                  size="icon"
                  variant="ghost"
                >
                  <HugeiconsIcon className="h-4 w-4" icon={Delete01Icon} />
                </Button>
              )}
            </div>
          </div>
          <StarRating rating={review.rating} showNumeric={false} size="sm" />
          <p className="text-sm text-foreground/80">{review.body}</p>
        </div>
      </div>

      {canDelete && (
        <AlertDialog onOpenChange={setConfirmOpen} open={confirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this review?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The review will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex justify-end gap-2">
              <AlertDialogCancel onClick={() => setConfirmOpen(false)} />
              <AlertDialogAction
                disabled={deleteMutation.isPending}
                onClick={() =>
                  deleteMutation.mutate({
                    id: review.id,
                    params: {
                      entityId: deleteEntityId as string,
                      entityType: deleteEntityType as DeletableEntityType,
                    },
                  })
                }
                variant="solid-destructive"
              >
                {deleteMutation.isPending ? "Deleting…" : "Delete"}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Card>
  );
}
