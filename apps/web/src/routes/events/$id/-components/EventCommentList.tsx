import { Delete01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { EmptyState } from "@/components/primitives/empty-state";
import { ErrorState } from "@/components/primitives/error-state";
import { InfiniteScrollArea } from "@/components/primitives/infinite-scroll-area";
import { LoadingState } from "@/components/primitives/loading-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/UserContext";
import { useDeleteEventsByIdCommentsByCommentId } from "@/generated/hooks/useDeleteEventsByIdCommentsByCommentId";
import { usePostEventsByIdComments } from "@/generated/hooks/usePostEventsByIdComments";
import { useRoles } from "@/hooks/useRoles";
import {
  type EventComment,
  eventCommentsQueryKey,
  useEventComments,
} from "@/routes/events/$id/-components/use-event-comments";

interface EventCommentListProps {
  eventId: string;
}

function commentAuthor(c: EventComment) {
  const name = [c.user?.fname, c.user?.lname].filter(Boolean).join(" ");
  return name || "Anonymous";
}

function commentDate(c: EventComment) {
  return new Date(c.createdAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function EventCommentList({ eventId }: EventCommentListProps) {
  const { user } = useUser();
  const isAdmin = useRoles().includes("admin");
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useEventComments(eventId);

  const postMutation = usePostEventsByIdComments({
    mutation: {
      onSuccess: () => {
        setDraft("");
        queryClient.invalidateQueries({ queryKey: eventCommentsQueryKey(eventId) });
      },
    },
  });

  const deleteMutation = useDeleteEventsByIdCommentsByCommentId({
    mutation: {
      onSuccess: () => {
        setConfirmDeleteId(null);
        queryClient.invalidateQueries({ queryKey: eventCommentsQueryKey(eventId) });
      },
    },
  });

  if (isLoading) {
    return <LoadingState variant="list" />;
  }

  if (isError) {
    return <ErrorState message="Could not load comments." onRetry={() => refetch()} />;
  }

  const comments = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div className="space-y-6">
      {user ? (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.trim()) return;
            postMutation.mutate({ data: { body: draft }, id: eventId });
          }}
        >
          <Textarea
            aria-label="Comment body"
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a comment…"
            rows={3}
            value={draft}
          />
          <div className="flex justify-end">
            <Button disabled={postMutation.isPending || !draft.trim()} type="submit">
              {postMutation.isPending ? "Posting…" : "Post comment"}
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">Sign in to leave a comment.</p>
      )}

      <Separator />

      {comments.length === 0 ? (
        <EmptyState
          description="Be the first to share a thought about this event."
          title="No comments yet"
        />
      ) : (
        <InfiniteScrollArea
          className="h-[28rem]"
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          itemCount={comments.length}
        >
          <ul className="space-y-4 pb-2">
            {comments.map((c) => {
              const canDelete = isAdmin || (!!user && user.id === c.userId);
              return (
                <li key={c.id}>
                  <Card variant="section">
                    <CardContent className="space-y-2 py-4">
                      <div className="flex items-baseline justify-between gap-4">
                        <span className="font-medium text-foreground">{commentAuthor(c)}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{commentDate(c)}</span>
                          {canDelete && (
                            <Button
                              aria-label="Delete comment"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => setConfirmDeleteId(c.id)}
                              size="icon"
                              variant="ghost"
                            >
                              <HugeiconsIcon className="h-4 w-4" icon={Delete01Icon} />
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="whitespace-pre-line text-sm text-muted-foreground">{c.body}</p>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        </InfiniteScrollArea>
      )}

      <AlertDialog
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
        open={confirmDeleteId !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The comment will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel onClick={() => setConfirmDeleteId(null)} />
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (confirmDeleteId) {
                  deleteMutation.mutate({ commentId: confirmDeleteId, id: eventId });
                }
              }}
              variant="solid-destructive"
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
