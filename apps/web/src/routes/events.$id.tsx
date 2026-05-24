import {
  ArrowLeft02Icon,
  Calendar01Icon,
  Location01Icon,
  Share01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useDeleteEventsByIdRegister } from "@/generated/hooks/useDeleteEventsByIdRegister";
import { useGetEventsById } from "@/generated/hooks/useGetEventsById";
import { useGetEventsByIdComments } from "@/generated/hooks/useGetEventsByIdComments";
import { useGetEventsByIdImages } from "@/generated/hooks/useGetEventsByIdImages";
import { usePostEventsByIdComments } from "@/generated/hooks/usePostEventsByIdComments";
import { usePostEventsByIdRegister } from "@/generated/hooks/usePostEventsByIdRegister";

export const Route = createFileRoute("/events/$id")({
  component: EventDetailPage,
});

type EventData = {
  id?: string;
  title?: string;
  name?: string;
  description?: string | null;
  startDate?: string | Date;
  endDate?: string | Date;
  startTime?: string | Date;
  endTime?: string | Date;
  location?: string;
  address?: { city?: string; country?: string; street?: string } | null;
  winemakerName?: string;
  winemakerId?: string;
  winemaker?: { id?: string; name?: string } | null;
  attendees?: number;
  capacity?: number;
};

type CommentItem = {
  id: string;
  body?: string;
  content?: string;
  createdAt?: string;
  userName?: string;
  userFname?: string;
  userLname?: string;
};

type ImageItem = {
  id: string;
  url?: string;
  publicUrl?: string;
};

function is409(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const maybe = error as { response?: { status?: number }; status?: number };
  return maybe.response?.status === 409 || maybe.status === 409;
}

function formatLocation(event: EventData): string | undefined {
  if (event.location) return event.location;
  const a = event.address;
  if (!a) return undefined;
  return [a.city, a.country].filter(Boolean).join(", ") || undefined;
}

function getEventTitle(e: EventData): string {
  return e.title || e.name || "Untitled Event";
}

function getEventDates(e: EventData): { startDate: Date | null; endDate: Date | null } {
  const rawStart = e.startDate ?? e.startTime;
  const rawEnd = e.endDate ?? e.endTime;
  return {
    endDate: rawEnd ? new Date(rawEnd) : null,
    startDate: rawStart ? new Date(rawStart) : null,
  };
}

function getEventWinemaker(e: EventData): { name: string | undefined; id: string | undefined } {
  return {
    id: e.winemaker?.id ?? e.winemakerId,
    name: e.winemaker?.name ?? e.winemakerName,
  };
}

function CommentsSection({ eventId }: { eventId: string }) {
  const { data, isLoading, refetch } = useGetEventsByIdComments(eventId);
  const commentMutation = usePostEventsByIdComments();
  const [body, setBody] = useState("");

  const rawComments = data as CommentItem[] | { data?: CommentItem[] } | undefined;
  const comments = Array.isArray(rawComments) ? rawComments : (rawComments?.data ?? []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    commentMutation.mutate(
      { data: { body: body.trim() }, id: eventId },
      {
        onSuccess: () => {
          setBody("");
          refetch();
        },
      }
    );
  };

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">Comments</h2>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton className="h-16 w-full rounded-lg" key={i} />
          ))}
        </div>
      )}
      {!isLoading && comments.length === 0 && (
        <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
      )}
      {!isLoading && comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((c) => {
            const author =
              c.userName ?? ([c.userFname, c.userLname].filter(Boolean).join(" ") || "Anonymous");
            const text = c.body ?? c.content ?? "";
            return (
              <div className="rounded-lg border bg-card p-4" key={c.id}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium">{author}</span>
                  {c.createdAt && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            );
          })}
        </div>
      )}

      <form className="space-y-2" onSubmit={handleSubmit}>
        <Textarea
          className="resize-none"
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
          value={body}
        />
        <Button disabled={commentMutation.isPending || !body.trim()} size="sm" type="submit">
          {commentMutation.isPending ? "Posting..." : "Post comment"}
        </Button>
        {commentMutation.isError && (
          <p className="text-xs text-destructive">Failed to post comment. Please try again.</p>
        )}
      </form>
    </section>
  );
}

function ImagesSection({ eventId }: { eventId: string }) {
  const { data, isLoading } = useGetEventsByIdImages(eventId);
  const rawImages = data as ImageItem[] | ImageItem | undefined;
  let images: ImageItem[];
  if (Array.isArray(rawImages)) {
    images = rawImages;
  } else if (rawImages) {
    images = [rawImages];
  } else {
    images = [];
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton className="aspect-video w-full rounded-lg" key={i} />
        ))}
      </div>
    );
  }

  if (images.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">Photos</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {images.map((img) => {
          const src = img.url ?? img.publicUrl;
          if (!src) return null;
          return (
            <img
              alt="Event"
              className="aspect-video w-full rounded-lg object-cover"
              key={img.id}
              src={src}
            />
          );
        })}
      </div>
    </section>
  );
}

function RegistrationCard({ id }: { id: string }) {
  const registerMutation = usePostEventsByIdRegister();
  const cancelMutation = useDeleteEventsByIdRegister();
  const alreadyRegistered = registerMutation.isSuccess || is409(registerMutation.error);

  return (
    <div className="rounded-2xl border bg-card p-6">
      <h3 className="font-heading mb-4 text-xl font-bold">Ready to Join?</h3>
      {alreadyRegistered ? (
        <Button
          className="mb-3 w-full"
          onClick={() => cancelMutation.mutate({ id })}
          variant="secondary"
        >
          {cancelMutation.isPending ? "Cancelling..." : "Cancel Registration"}
        </Button>
      ) : (
        <Button
          className="mb-3 w-full"
          disabled={registerMutation.isPending}
          onClick={() => registerMutation.mutate({ id })}
        >
          {registerMutation.isPending ? "Registering..." : "Register for Event"}
        </Button>
      )}
    </div>
  );
}

function EventDetailPage() {
  const { id } = Route.useParams();
  const { data: event, isLoading, isError, refetch } = useGetEventsById(id);

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
        <Skeleton className="h-5 w-32" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-48 w-full rounded-2xl" />
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

  const e = event as EventData;
  const title = getEventTitle(e);
  const { startDate, endDate } = getEventDates(e);
  const locationLabel = formatLocation(e);
  const { name: winemakerName, id: winemakerId } = getEventWinemaker(e);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href).catch((_err) => {
      // clipboard write failed silently
    });
  };

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <Link
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        to="/events"
      >
        <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} />
        Back to events
      </Link>

      <div className="space-y-2">
        <h1 className="font-heading text-4xl font-bold lg:text-5xl">{title}</h1>
        {startDate && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <HugeiconsIcon className="h-4 w-4" icon={Calendar01Icon} />
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
        {locationLabel && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <HugeiconsIcon className="h-4 w-4" icon={Location01Icon} />
            <span>{locationLabel}</span>
          </div>
        )}
      </div>

      <ImagesSection eventId={id} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {e.description && (
            <div className="space-y-3">
              <h2 className="font-heading text-2xl font-bold">About This Event</h2>
              <p className="leading-relaxed text-muted-foreground">{e.description}</p>
            </div>
          )}

          {e.attendees !== undefined && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <HugeiconsIcon className="h-5 w-5 text-primary" icon={UserGroupIcon} />
              <span>
                {e.attendees}
                {e.capacity ? ` / ${e.capacity}` : ""} attending
              </span>
            </div>
          )}

          <Separator />

          <CommentsSection eventId={id} />
        </div>

        <div className="space-y-4">
          <RegistrationCard id={id} />
          <div className="rounded-2xl border bg-card p-6">
            <Button className="w-full" onClick={handleShare} variant="outline">
              <HugeiconsIcon className="mr-2 h-4 w-4" icon={Share01Icon} />
              Share Event
            </Button>
          </div>

          {winemakerName && (
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="font-heading mb-4 text-lg font-bold">Hosted By</h3>
              <p className="mb-3 font-semibold text-primary">{winemakerName}</p>
              {winemakerId && (
                <Button
                  className="w-full"
                  render={<Link params={{ id: winemakerId }} to="/winemakers/$id" />}
                  variant="outline"
                >
                  Visit Winemaker Profile
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
