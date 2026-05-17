import { Location01Icon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { CatalogPlaceholder } from "@/components/catalog/CatalogPlaceholder";
import { Card } from "@/components/ui/card";

export interface EventCardEvent {
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
  imageUrl?: string;
}

interface EventCardProps {
  event: EventCardEvent;
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
    <Card className="group relative overflow-hidden" variant="default">
      <div className="aspect-video w-full overflow-hidden bg-muted">
        {event.imageUrl ? (
          <img
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            src={event.imageUrl}
          />
        ) : (
          <CatalogPlaceholder text={formattedDate ?? "EVENT"} />
        )}
      </div>

      <div className="space-y-3 p-5">
        <h3 className="line-clamp-2 font-heading text-lg font-bold">
          <Link
            className="stretched-link transition-colors hover:text-primary focus:outline-none"
            params={{ id: event.id }}
            to="/events/$id"
          >
            {title}
          </Link>
        </h3>

        {formattedDate && (
          <p className="text-sm font-semibold text-primary">{formattedDate}</p>
        )}

        {event.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <HugeiconsIcon aria-hidden className="h-4 w-4" icon={Location01Icon} />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        )}

        {event.winemakerName && (
          <p className="text-sm text-muted-foreground">
            <span>By </span>
            <span className="font-medium text-foreground">{event.winemakerName}</span>
          </p>
        )}

        {event.attendees !== undefined && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <HugeiconsIcon aria-hidden className="h-4 w-4" icon={UserGroupIcon} />
            <span>{event.attendees} attending</span>
          </div>
        )}
      </div>
    </Card>
  );
}
