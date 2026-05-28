import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { DataGrid } from "@/components/primitives/data-grid";
import { LoadingState } from "@/components/primitives/loading-state";
import { Section } from "@/components/primitives/section";
import { Button } from "@/components/ui/button";
import { useGetEvents } from "@/generated/hooks/useGetEvents";
import { EventCard } from "@/components/events/EventCard";

export function HomeFeaturedEvents() {
  const { data, isLoading } = useGetEvents();

  if (isLoading) return <LoadingState variant="catalog" />;

  const events = (Array.isArray(data) ? data : []).slice(0, 3);
  if (events.length === 0) return null;

  return (
    <Section
      actions={
        <Button render={<Link to="/events" />} size="sm" variant="outline">
          View all
          <HugeiconsIcon className="ml-2 h-3.5 w-3.5" icon={ArrowRight01Icon} />
        </Button>
      }
      heading="Upcoming events"
    >
      <DataGrid variant="catalog">
        {events.map((event: { id: string }) => (
          <EventCard event={event} key={event.id} />
        ))}
      </DataGrid>
    </Section>
  );
}
