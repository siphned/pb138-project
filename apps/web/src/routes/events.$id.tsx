import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar, MapPin, Share2, Users } from "lucide-react";
import { StubGet } from "@/components/dev/StubGet";
import { StubMutation } from "@/components/dev/StubMutation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDeleteEventsByIdRegister } from "@/generated/hooks/useDeleteEventsByIdRegister";
import { useGetEventsById } from "@/generated/hooks/useGetEventsById";
import { useGetEventsByIdComments } from "@/generated/hooks/useGetEventsByIdComments";
import { useGetEventsByIdImages } from "@/generated/hooks/useGetEventsByIdImages";
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
        <div className="h-6 w-32 animate-pulse rounded-md bg-secondary/20" />
        <div className="space-y-6">
          <div className="h-12 w-1/2 animate-pulse rounded-md bg-secondary/20" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="h-40 col-span-2 animate-pulse rounded-2xl bg-secondary/20" />
            <div className="h-40 animate-pulse rounded-2xl bg-secondary/20" />
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
  const startDate = event?.startDate ? new Date(event.startDate) : null;
  const endDate = event?.endDate ? new Date(event.endDate) : null;

  return (
    <div className="container mx-auto px-6 py-8 lg:px-12 space-y-8">
      <Link
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        to="/events"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to events
      </Link>

      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="font-heading text-4xl font-bold lg:text-5xl">{title}</h1>
          {startDate && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
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
            {event?.location && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Location</h3>
                </div>
                <p className="text-muted-foreground">{event.location}</p>
              </div>
            )}

            {event?.attendees !== undefined && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Attendees</h3>
                </div>
                <p className="text-muted-foreground">{event.attendees} people attending</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* CTA Card */}
          <div className="rounded-2xl border bg-card p-6">
            <h3 className="font-heading text-xl font-bold mb-4">Ready to Join?</h3>
            <Button className="w-full mb-3">Register for Event</Button>
            <Button className="w-full" variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Share Event
            </Button>
          </div>

          {/* Winemaker info */}
          {event?.winemakerName && (
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="font-heading text-lg font-bold mb-4">Hosted By</h3>
              <div className="space-y-3">
                <p className="font-semibold text-primary">{event.winemakerName}</p>
                {event?.winemakerId && (
                  <Link params={{ id: event.winemakerId }} to="/winemakers/$id">
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

      {/* [STUB] hook audit */}
      <details className="container mx-auto p-6">
        <summary className="cursor-pointer font-mono text-sm">[STUB] hook audit</summary>
        <EventDetailStubAudit id={id} />
      </details>
    </div>
  );
}

function EventDetailStubAudit({ id }: { id: string }) {
  const commentsQuery = useGetEventsByIdComments({ id });
  const imagesQuery = useGetEventsByIdImages({ id });
  const registerMutation = usePostEventsByIdRegister();
  const cancelMutation = useDeleteEventsByIdRegister();
  const commentMutation = usePostEventsByIdComments();
  return (
    <>
      <StubGet
        actorRole="guest+"
        hookName="useGetEventsByIdComments"
        query={commentsQuery}
        title="Comments"
      />
      <StubGet
        actorRole="guest+"
        hookName="useGetEventsByIdImages"
        query={imagesQuery}
        title="Images"
      />
      <StubMutation
        actorRole="customer+"
        hookName="usePostEventsByIdRegister"
        mutation={registerMutation}
        payloadExample={{ id }}
        title="Register"
      />
      <StubMutation
        actorRole="customer+"
        hookName="useDeleteEventsByIdRegister"
        mutation={cancelMutation}
        payloadExample={{ id }}
        title="Cancel registration"
      />
      <StubMutation
        actorRole="customer+"
        hookName="usePostEventsByIdComments"
        mutation={commentMutation}
        payloadExample={{ data: { body: "Test comment" }, id }}
        title="Post comment"
      />
    </>
  );
}
