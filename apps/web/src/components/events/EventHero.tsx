import { Calendar03Icon, Location01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { CatalogPlaceholder } from "@/components/catalog/CatalogPlaceholder";

export interface EventHeroEvent {
  id: string;
  title?: string;
  name?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  location?: string;
  winemakerName?: string;
  winemakerId?: string;
  imageUrl?: string;
}

interface EventHeroProps {
  event: EventHeroEvent;
}

function formatDateRange(start?: string | Date, end?: string | Date) {
  if (!start) return null;
  const startDate = new Date(start);
  const startStr = startDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    weekday: "long",
    year: "numeric",
  });
  if (!end) return startStr;
  const endDate = new Date(end);
  if (startDate.getTime() === endDate.getTime()) return startStr;
  const endStr = endDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    weekday: "long",
  });
  return `${startStr} – ${endStr}`;
}

export function EventHero({ event }: EventHeroProps) {
  const title = event.title || event.name || "Untitled Event";
  const dateLabel = formatDateRange(event.startDate, event.endDate);

  return (
    <div className="space-y-6">
      <div className="aspect-[21/9] w-full overflow-hidden rounded-2xl bg-muted">
        {event.imageUrl ? (
          <img alt={title} className="h-full w-full object-cover" src={event.imageUrl} />
        ) : (
          <CatalogPlaceholder text={title} />
        )}
      </div>

      <div className="space-y-3">
        <h1 className="font-heading text-4xl font-bold lg:text-5xl">{title}</h1>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {dateLabel && (
            <div className="flex items-center gap-2">
              <HugeiconsIcon aria-hidden className="h-4 w-4" icon={Calendar03Icon} />
              <span>{dateLabel}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-2">
              <HugeiconsIcon aria-hidden className="h-4 w-4" icon={Location01Icon} />
              <span>{event.location}</span>
            </div>
          )}
          {event.winemakerName && (
            <div>
              <span>Hosted by </span>
              {event.winemakerId ? (
                <Link
                  className="font-medium text-foreground hover:underline"
                  params={{ id: event.winemakerId }}
                  to="/winemakers/$id"
                >
                  {event.winemakerName}
                </Link>
              ) : (
                <span className="font-medium text-foreground">{event.winemakerName}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
