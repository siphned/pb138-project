import { Link } from "@tanstack/react-router";
import { MapPin, Users } from "lucide-react";
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
      <div className="rounded-2xl border bg-card p-6 transition-all hover:shadow-lg hover:border-primary">
        {/* Header with date badge */}
        <div className="mb-4 flex items-start justify-between">
          {formattedDate && (
            <div className="inline-block rounded-md bg-primary/10 px-3 py-1">
              <p className="text-sm font-semibold text-primary">{formattedDate}</p>
            </div>
          )}
        </div>

        {/* Event title */}
        <h3 className="mb-2 line-clamp-2 font-heading text-lg font-bold">{title}</h3>

        {/* Description */}
        {event.description && (
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
        )}

        {/* Location */}
        {event.location && (
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        )}

        {/* Winemaker and attendees */}
        <div className="mb-4 space-y-2 border-t pt-4">
          {event.winemakerName && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">By:</span>
              <span className="font-medium text-primary">{event.winemakerName}</span>
            </div>
          )}
          {event.attendees !== undefined && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{event.attendees} attending</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <Button className="w-full" size="sm">
          View Details
        </Button>
      </div>
    </Link>
  );
}
