import { Location01Icon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { EventImage } from "@/components/catalog/EventImage";
import { Button } from "@/components/ui/button";

interface EventCardProps {
  event: {
    id: string;
    title?: string;
    name?: string;
    description?: string | null;
    startDate?: string | Date;
    endDate?: string | Date;
    location?: string;
    winemakerName?: string;
    winemakerId?: string;
    attendees?: number;
  };
}

export function EventCard({ event }: EventCardProps) {
  const title = event.title || event.name || "Untitled Event";
  const startDate = event.startDate ? new Date(event.startDate) : null;
  const formattedDate = startDate?.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Link params={{ id: event.id }} to="/events/$id">
      <div className="group rounded-2xl border bg-card transition-all hover:shadow-lg hover:border-primary">
        <div className="aspect-3/4 w-full overflow-hidden rounded-t-2xl bg-muted">
          <EventImage alt={title} eventId={event.id} fallbackText={title} />
        </div>

        <div className="p-6">
          <div className="mb-4 flex items-start justify-between">
            {formattedDate && (
              <div className="inline-block rounded-md bg-primary/10 px-3 py-1">
                <p className="text-sm font-semibold text-primary">{formattedDate}</p>
              </div>
            )}
          </div>

          <h3 className="mb-2 line-clamp-2 font-heading text-lg font-bold">{title}</h3>

          {event.description && (
            <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
          )}

          {event.location && (
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <HugeiconsIcon className="h-4 w-4" icon={Location01Icon} />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}

          <div className="mb-4 space-y-2 border-t pt-4">
            {event.winemakerName && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">By:</span>
                <span className="font-medium text-primary">{event.winemakerName}</span>
              </div>
            )}
            {event.attendees !== undefined && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <HugeiconsIcon className="h-4 w-4" icon={UserGroupIcon} />
                <span>{event.attendees} attending</span>
              </div>
            )}
          </div>

          <Button className="w-full" size="sm">
            View Details
          </Button>
        </div>
      </div>
    </Link>
  );
}
