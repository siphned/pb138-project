import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { EventCommentList } from "@/components/events/EventCommentList";
import { EventDetailsCard } from "@/components/events/EventDetailsCard";
import { EventHero } from "@/components/events/EventHero";
import { EventManageMenu } from "@/components/events/EventManageMenu";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { Section } from "@/components/primitives/section";
import { useGetEventsById } from "@/generated/hooks/useGetEventsById";

export const Route = createFileRoute("/events/$id")({
  component: EventDetailPage,
});

function EventDetailPage() {
  const { id } = Route.useParams();
  const { data: event, isLoading, isError, refetch } = useGetEventsById(id);

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8 lg:px-12">
        <LoadingState variant="detail" />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="container mx-auto px-6 py-8 lg:px-12">
        <ErrorState
          message="We couldn't find the event you're looking for."
          onRetry={() => refetch()}
          title="Event not found"
        />
      </div>
    );
  }

  const ownerUserId =
    (event as { ownerUserId?: string; winemakerOwnerUserId?: string }).ownerUserId ??
    (event as { winemakerOwnerUserId?: string }).winemakerOwnerUserId;

  return (
    <div className="container mx-auto space-y-12 px-6 py-8 lg:px-12">
      <div className="flex items-center justify-between gap-4">
        <Link
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus:outline-none"
          to="/events"
        >
          <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} />
          Back to events
        </Link>

        {ownerUserId && <EventManageMenu eventId={id} ownerUserId={ownerUserId} />}
      </div>

      <EventHero event={event} />

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <EventDetailsCard event={event} />

        <div className="space-y-6">
          <Section heading="Discussion">
            <EventCommentList eventId={id} />
          </Section>
        </div>
      </div>
    </div>
  );
}
