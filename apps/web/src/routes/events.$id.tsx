import { useAuth } from "@clerk/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarIcon, MapPinIcon, ShareIcon, Users2Icon } from "hugeicons-react";
import { useCallback, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/UserContext";
import { useDeleteEventsByIdRegister } from "@/generated/hooks/useDeleteEventsByIdRegister";
import { useGetEventsById } from "@/generated/hooks/useGetEventsById";
import { useGetEventsByIdComments } from "@/generated/hooks/useGetEventsByIdComments";
import { usePostEventsByIdComments } from "@/generated/hooks/usePostEventsByIdComments";
import { usePostEventsByIdRegister } from "@/generated/hooks/usePostEventsByIdRegister";

export const Route = createFileRoute("/events/$id")({
  component: EventDetailPage,
});

function EventDetailPage() {
  const { id } = Route.useParams();
  const { data: event, isLoading, isError, refetch } = useGetEventsById(id);

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8 lg:px-12 space-y-8">
        <Skeleton className="h-6 w-32" />
        <div className="space-y-6">
          <Skeleton className="h-12 w-1/2" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Skeleton className="h-40 col-span-2 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="container mx-auto flex flex-col items-center py-24 text-center">
        <p className="font-bold text-destructive">Failed to load event details.</p>
        <Button onClick={() => refetch()} variant="link">
          Retry
        </Button>
      </div>
    );
  }

  const title = event?.title || event?.name || "Untitled Event";
  const startDate = event?.startTime ? new Date(event.startTime) : null;
  const endDate = event?.endTime ? new Date(event.endTime) : null;

  return (
    <div className="container mx-auto px-6 py-8 lg:px-12 space-y-8">
      <Link
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        to="/events"
      >
        <div className="h-4 w-4" />
        Back to events
      </Link>

      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="font-heading text-4xl font-bold lg:text-5xl">{title}</h1>
          {startDate && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              <span>
                {startDate.toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  weekday: "long",
                  year: "numeric",
                })}
                {endDate && startDate.getTime() !== endDate.getTime() && (
                  <>
                    {" "}
                    to{" "}
                    {endDate.toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      weekday: "long",
                    })}
                  </>
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {event?.description && (
            <div className="space-y-3">
              <h2 className="font-heading text-2xl font-bold">About This Event</h2>
              <p className="leading-relaxed text-muted-foreground">{event.description}</p>
            </div>
          )}

          <Separator />

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-6">
            {event?.address && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Location</h3>
                </div>
                <p className="text-muted-foreground">
                  {event.address.street} {event.address.houseNumber}
                  <br />
                  {event.address.city}, {event.address.postalCode}
                </p>
              </div>
            )}

            {event?.capacity !== undefined && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users2Icon className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Capacity</h3>
                </div>
                <p className="text-muted-foreground">{event.capacity} spots available</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Comments Section */}
          <EventCommentsSection eventId={id} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registration Card */}
          <EventRegistrationCard eventId={id} />

          {/* Winemaker info */}
          {event?.winemaker && (
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="font-heading text-lg font-bold mb-4">Hosted By</h3>
              <div className="space-y-3">
                <p className="font-semibold text-primary">{event.winemaker.name}</p>
                {event.winemaker.id && (
                  <Link params={{ id: event.winemaker.id }} to="/winemakers/$id">
                    <Button className="w-full" variant="outline">
                      Visit Winemaker Profile
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EventRegistrationCard({ eventId }: { eventId: string }) {
  const { isSignedIn } = useAuth();
  const [isRegistered, setIsRegistered] = useState(false);

  const registerMutation = usePostEventsByIdRegister({
    mutation: {
      onError: (error: Record<string, unknown>) => {
        const errorData = error?.response as Record<string, unknown>;
        const message = errorData?.data as Record<string, unknown>;
        if (typeof message?.message === "string" && message.message.includes("already")) {
          setIsRegistered(true);
        }
      },
      onSuccess: () => {
        setIsRegistered(true);
      },
    },
  });

  const unregisterMutation = useDeleteEventsByIdRegister({
    mutation: {
      onSuccess: () => {
        setIsRegistered(false);
      },
    },
  });

  const handleRegister = useCallback(() => {
    registerMutation.mutate({ id: eventId });
  }, [eventId, registerMutation]);

  const handleUnregister = useCallback(() => {
    unregisterMutation.mutate({ id: eventId });
  }, [eventId, unregisterMutation]);

  if (!isSignedIn) {
    return (
      <div className="rounded-2xl border bg-card p-6">
        <h3 className="font-heading text-xl font-bold mb-4">Ready to Join?</h3>
        <p className="text-sm text-muted-foreground mb-4">Sign in to register for this event.</p>
        <Link to="/auth/sign-in">
          <Button className="w-full">Sign In</Button>
        </Link>
      </div>
    );
  }

  if (isRegistered) {
    return (
      <div className="rounded-2xl border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Badge
            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
            variant="outline"
          >
            ✓ Registered
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">You are registered for this event.</p>
        <Button
          className="w-full"
          disabled={unregisterMutation.isPending}
          onClick={handleUnregister}
          variant="outline"
        >
          {unregisterMutation.isPending ? "Canceling..." : "Cancel Registration"}
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-6">
      <h3 className="font-heading text-xl font-bold mb-4">Ready to Join?</h3>
      <Button
        className="w-full mb-3"
        disabled={registerMutation.isPending}
        onClick={handleRegister}
      >
        {registerMutation.isPending ? "Registering..." : "Register for Event"}
      </Button>
      <Button className="w-full" disabled variant="outline">
        <ShareIcon className="mr-2 h-4 w-4" />
        Share Event
      </Button>
    </div>
  );
}

interface CommentWithUser {
  body: string;
  createdAt: string;
  id: string;
  user: {
    fname: string;
    id: string;
    lname: string;
  };
}

function EventCommentsSection({ eventId }: { eventId: string }) {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [commentText, setCommentText] = useState("");

  const {
    data: commentsResponse,
    isLoading: isLoadingComments,
    refetch: refetchComments,
  } = useGetEventsByIdComments(eventId);

  const commentMutation = usePostEventsByIdComments({
    mutation: {
      onSuccess: () => {
        setCommentText("");
        refetchComments();
      },
    },
  });

  const handleSubmitComment = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!commentText.trim()) return;

      commentMutation.mutate({
        data: { body: commentText },
        id: eventId,
      });
    },
    [commentText, eventId, commentMutation]
  );

  // Extract comments from paginated response
  const comments: CommentWithUser[] = commentsResponse?.data ?? [];

  const renderCommentsList = (
    isLoading: boolean,
    commentsList: CommentWithUser[]
  ): React.ReactNode => {
    if (isLoading) {
      return (
        <>
          <CommentSkeleton />
          <CommentSkeleton />
        </>
      );
    }

    if (commentsList && commentsList.length > 0) {
      return commentsList.map((comment) => <CommentItem comment={comment} key={comment.id} />);
    }

    return (
      <div className="rounded-lg border border-dashed p-4 text-center">
        <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold">Comments</h2>

      {/* Comment Form */}
      {isSignedIn && user ? (
        <form className="space-y-4" onSubmit={handleSubmitComment}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="comment-textarea">
              Add a comment
            </label>
            <Textarea
              className="resize-none"
              disabled={commentMutation.isPending}
              id="comment-textarea"
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share your thoughts about this event..."
              value={commentText}
            />
          </div>
          <Button disabled={!commentText.trim() || commentMutation.isPending} type="submit">
            {commentMutation.isPending ? "Posting..." : "Post Comment"}
          </Button>
        </form>
      ) : (
        <div className="rounded-lg border border-dashed bg-muted/50 p-4 text-center">
          <p className="text-sm text-muted-foreground mb-3">Sign in to leave a comment</p>
          <Link to="/auth/sign-in">
            <Button size="sm" variant="outline">
              Sign In
            </Button>
          </Link>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">{renderCommentsList(isLoadingComments, comments)}</div>
    </div>
  );
}

function CommentItem({ comment }: { comment: CommentWithUser }) {
  const createdDate = new Date(comment.createdAt);
  const initials = `${comment.user.fname[0]}${comment.user.lname[0]}`.toUpperCase();

  return (
    <div className="flex gap-3 rounded-lg border bg-card p-4">
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm">
            {comment.user.fname} {comment.user.lname}
          </p>
          <span className="text-xs text-muted-foreground">
            {createdDate.toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
        <p className="text-sm text-foreground">{comment.body}</p>
      </div>
    </div>
  );
}

function CommentSkeleton() {
  return (
    <div className="flex gap-3 rounded-lg border bg-card p-4">
      <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
