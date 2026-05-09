import { createFileRoute } from "@tanstack/react-router";
import { Calendar } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { useGetEvents } from "@/generated/hooks/useGetEvents";
import { EventCard } from "./-components/EventCard";

export const Route = createFileRoute("/events/")({
  component: EventsPage,
});

function EventsPage() {
  const { data: events = [], isLoading, error, refetch } = useGetEvents({});

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-6 py-8 lg:px-12 space-y-8">
          <h1 className="font-heading text-4xl font-bold">Upcoming Events</h1>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div className="h-60 animate-pulse rounded-2xl bg-secondary/20" key={i} />
            ))}
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error) {
    return (
      <PublicLayout>
        <div className="container mx-auto flex flex-col items-center py-24 text-center">
          <p className="font-bold text-destructive">Failed to load events.</p>
          <Button onClick={() => refetch()} variant="link">
            Retry
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const eventsList = Array.isArray(events) ? events : events.data || [];

  return (
    <PublicLayout>
      <div className="container mx-auto px-6 py-8 lg:px-12 space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <h1 className="font-heading text-4xl font-bold">Upcoming Events</h1>
          </div>
          <p className="text-muted-foreground">
            Discover wine tastings, festivals, and exclusive gatherings hosted by our winemakers.
          </p>
        </div>

        {eventsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-20 text-center">
            <Calendar className="h-16 w-16 text-muted-foreground/30" />
            <h3 className="text-xl font-bold">No events available</h3>
            <p className="max-w-xs text-muted-foreground">
              Check back soon for new events from your favorite winemakers.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {eventsList.map((event: (typeof eventsList)[0]) => (
              <EventCard event={event} key={event.id} />
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
