import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { EmptyState } from "@/components/primitives/empty-state";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/UserContext";
import { usePostEventsByIdComments } from "@/generated/hooks/usePostEventsByIdComments";
import { cn } from "@/lib/utils";
import { type EventComment, eventCommentsQueryKey, useEventComments } from "./use-event-comments";

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

  const boxRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(true);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const root = boxRef.current?.querySelector<HTMLElement>('[data-slot="scroll-area-viewport"]');
    if (!sentinel || !root || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { root, rootMargin: "0px 0px 120px 0px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const commentCount = data?.pages.reduce((n, p) => n + p.data.length, 0) ?? 0;

  useLayoutEffect(() => {
    if (commentCount === 0) return;
    const viewport = boxRef.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]'
    );
    if (!viewport) return;

    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      setAtBottom(scrollTop + clientHeight >= scrollHeight - 8);
    };
    update();
    viewport.addEventListener("scroll", update, { passive: true });
    return () => viewport.removeEventListener("scroll", update);
  }, [commentCount]);

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
        <div className="space-y-3" ref={boxRef}>
          <ScrollArea
            className={cn(
              "h-[28rem] pr-4",
              !atBottom &&
                "[-webkit-mask-image:linear-gradient(to_bottom,black_calc(100%_-_3rem),transparent)] [mask-image:linear-gradient(to_bottom,black_calc(100%_-_3rem),transparent)]"
            )}
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
              <div aria-hidden className="h-px w-full" ref={sentinelRef} />
              {isFetchingNextPage && (
                <div aria-busy="true" aria-live="polite">
                  <Skeleton className="h-20 w-full" />
                </div>
              )}
            </ul>
          </ScrollArea>
          {hasNextPage && (
            <div className="flex justify-center">
              <Button
                className="text-muted-foreground text-xs"
                disabled={isFetchingNextPage}
                onClick={() => fetchNextPage()}
                size="sm"
                variant="ghost"
              >
                {isFetchingNextPage ? "Loading…" : "Show more"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
