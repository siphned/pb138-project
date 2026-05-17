import { useState } from "react";
import { EmptyState } from "@/components/primitives/empty-state";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/UserContext";
import { useGetEventsByIdComments } from "@/generated/hooks/useGetEventsByIdComments";
import { usePostEventsByIdComments } from "@/generated/hooks/usePostEventsByIdComments";

interface EventCommentListProps {
  eventId: string;
}

interface CommentLike {
  id?: string;
  body?: string;
  content?: string;
  text?: string;
  authorName?: string;
  author?: { name?: string; fname?: string; lname?: string };
  createdAt?: string | Date;
}

function commentBody(c: CommentLike) {
  return c.body ?? c.content ?? c.text ?? "";
}

function commentAuthor(c: CommentLike) {
  if (c.authorName) return c.authorName;
  if (c.author?.name) return c.author.name;
  if (c.author?.fname || c.author?.lname) {
    return [c.author.fname, c.author.lname].filter(Boolean).join(" ");
  }
  return "Anonymous";
}

function commentDate(c: CommentLike) {
  if (!c.createdAt) return null;
  return new Date(c.createdAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function EventCommentList({ eventId }: EventCommentListProps) {
  const { user } = useUser();
  const [draft, setDraft] = useState("");
  const query = useGetEventsByIdComments(eventId);
  const postMutation = usePostEventsByIdComments({
    mutation: {
      onSuccess: () => {
        setDraft("");
        query.refetch();
      },
    },
  });

  if (query.isLoading) {
    return <LoadingState variant="list" />;
  }

  if (query.isError) {
    return <ErrorState message="Could not load comments." onRetry={() => query.refetch()} />;
  }

  const raw = query.data;
  const list: CommentLike[] = Array.isArray(raw)
    ? raw
    : ((raw as { data?: CommentLike[] } | undefined)?.data ?? []);

  return (
    <div className="space-y-6">
      {list.length === 0 ? (
        <EmptyState
          description="Be the first to share a thought about this event."
          title="No comments yet"
        />
      ) : (
        <ul className="space-y-4">
          {list.map((c, idx) => (
            <li key={c.id ?? idx}>
              <Card variant="section">
                <CardContent className="space-y-2 pt-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-medium text-foreground">{commentAuthor(c)}</span>
                    {commentDate(c) && (
                      <span className="text-xs text-muted-foreground">{commentDate(c)}</span>
                    )}
                  </div>
                  <p className="whitespace-pre-line text-sm text-muted-foreground">
                    {commentBody(c)}
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {user ? (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.trim()) return;
            postMutation.mutate({ id: eventId, data: { body: draft } as never });
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
    </div>
  );
}
