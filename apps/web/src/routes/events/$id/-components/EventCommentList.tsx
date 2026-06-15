import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { EmptyState } from "@/components/primitives/empty-state";
import { ErrorState } from "@/components/primitives/error-state";
import { InfiniteScrollArea } from "@/components/primitives/infinite-scroll-area";
import { LoadingState } from "@/components/primitives/loading-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/UserContext";
import { usePostEventsByIdComments } from "@/generated/hooks/usePostEventsByIdComments";
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
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");

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
            {comments.map((c) => (
              <li key={c.id}>
                <Card variant="section">
                  <CardContent className="space-y-2 pt-6">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="font-medium text-foreground">{commentAuthor(c)}</span>
                      <span className="text-xs text-muted-foreground">{commentDate(c)}</span>
                    </div>
                    <p className="whitespace-pre-line text-sm text-muted-foreground">{c.body}</p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </InfiniteScrollArea>
      )}
    </div>
  );
}
