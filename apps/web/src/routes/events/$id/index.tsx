import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { LocationMapEmbed } from "@/components/primitives/location-map-embed";
import { Section } from "@/components/primitives/section";
import { Separator } from "@/components/ui/separator";
import { useGetEventsById } from "@/generated/hooks/useGetEventsById";
import { useGetEventsByIdImages } from "@/generated/hooks/useGetEventsByIdImages";
import { useGetWinemakersMe } from "@/generated/hooks/useGetWinemakersMe";
import { useRoles } from "@/hooks/useRoles";
import { EventCommentList } from "@/routes/events/$id/-components/EventCommentList";
import { EventDetailsCard } from "@/routes/events/$id/-components/EventDetailsCard";
import { EventGallery } from "@/routes/events/$id/-components/EventGallery";
import { EventHero } from "@/routes/events/$id/-components/EventHero";
import { EventManageMenu } from "@/routes/events/$id/-components/EventManageMenu";

export const Route = createFileRoute("/events/$id/")({
  component: EventDetailPage,
});

function EventDetailPage() {
  const { id } = Route.useParams();
  const roles = useRoles();
  const { data: event, isLoading, isError, refetch } = useGetEventsById(id);
  const { data: eventImages } = useGetEventsByIdImages(id);
  const { data: myWinemaker } = useGetWinemakersMe({
    query: { enabled: roles.includes("winemaker") },
  });

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

  const eventWinemakerId =
    (event as { winemaker?: { id?: string }; winemakerId?: string }).winemaker?.id ??
    (event as { winemakerId?: string }).winemakerId;
  const canManage =
    roles.includes("admin") || (!!myWinemaker?.id && myWinemaker.id === eventWinemakerId);

  const title =
    (event as { title?: string; name?: string }).title ?? event.name ?? "Untitled Event";

  const heroEvent = {
    ...event,
    winemakerId: event.winemaker?.id ?? event.winemakerId,
    winemakerName: event.winemaker?.name ?? event.winemakerName,
  };

  const address = event.address as
    | { street?: string; houseNumber?: string; city?: string; country?: string }
    | null
    | undefined;
  const hasAddress = !!(address?.street && address.city && address.country);

  return (
    <div className="container mx-auto space-y-12 px-6 py-8 lg:px-12">
      <div className="flex items-center justify-between gap-4">
        <Link
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          to="/events"
        >
          <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} />
          All events
        </Link>

        <EventManageMenu canManage={canManage} eventId={id} />
      </div>

      <EventHero event={heroEvent} />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div>
          <EventGallery eventName={title} images={eventImages?.map((img) => img.url)} />
        </div>

        <EventDetailsCard event={event} />
      </div>

      {hasAddress && (
        <Section heading="Location">
          <LocationMapEmbed
            address={{
              city: address.city ?? "",
              country: address.country ?? "",
              houseNumber: address.houseNumber ?? "",
              street: address.street ?? "",
            }}
            title={`${title} location`}
          />
        </Section>
      )}

      <Separator />

      <Section heading="Discussion">
        <EventCommentList eventId={id} />
      </Section>
    </div>
  );
}
