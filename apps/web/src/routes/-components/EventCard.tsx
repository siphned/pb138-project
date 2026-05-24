import { Location01Icon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import type { MouseEvent } from "react";
import { CatalogCard, catalogCardLinkClass } from "@/components/catalog/CatalogCard";
import { EventImage } from "@/components/catalog/EventImage";
import { Button } from "@/components/ui/button";
import { usePostEventsByIdRegister } from "@/generated/hooks/usePostEventsByIdRegister";

interface EventLike {
  id: string;
  /** Preferred BE field. `title` is a legacy alias from earlier stubs. */
  name?: string;
  title?: string;
  description?: string | null;
  /** BE returns `startTime` / `endTime` as ISO strings; legacy callers pass `startDate` / `endDate`. */
  startTime?: string | Date;
  endTime?: string | Date;
  startDate?: string | Date;
  endDate?: string | Date;
  /** BE relation; legacy callers may flatten to `location`. */
  address?: { city?: string; country?: string; street?: string; houseNumber?: string } | null;
  location?: string;
  /** BE relation; legacy callers may flatten to `winemakerName` + `winemakerId`. */
  winemaker?: { id?: string; name?: string } | null;
  winemakerName?: string;
  winemakerId?: string;
  attendees?: number;
  capacity?: number;
}

interface EventCardProps {
  event: EventLike;
}

function is409(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const maybe = error as { response?: { status?: number }; status?: number };
  return maybe.response?.status === 409 || maybe.status === 409;
}

function formatLocation(event: EventLike): string | undefined {
  if (event.location) return event.location;
  const a = event.address;
  if (!a) return undefined;
  return [a.city, a.country].filter(Boolean).join(", ") || undefined;
}

function renderCapacityLabel(attendees?: number, capacity?: number): string | null {
  if (attendees !== undefined && capacity !== undefined) return `${attendees}/${capacity}`;
  if (attendees !== undefined) return `${attendees}`;
  if (capacity !== undefined) return `max ${capacity}`;
  return null;
}

export function EventCard({ event }: EventCardProps) {
  const title = event.name || event.title || "Untitled Event";
  const start = event.startTime ?? event.startDate;
  const startDate = start ? new Date(start) : null;
  const formattedDate = startDate?.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const winemakerName = event.winemaker?.name || event.winemakerName;
  const locationLabel = formatLocation(event);
  const capacityLabel = renderCapacityLabel(event.attendees, event.capacity);

  const mutation = usePostEventsByIdRegister();
  const alreadyRegistered = mutation.isSuccess || is409(mutation.error);

  const handleRegister = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (mutation.isPending) return;
    mutation.mutate({ id: event.id });
  };

  const registeredCta = (
    <Button
      className="relative z-10 mt-1 w-full"
      render={<Link params={{ id: event.id }} to="/events/$id" />}
      size="sm"
      variant="secondary"
    >
      Already registered — view details
    </Button>
  );

  const registerCta = (
    <Button
      className="relative z-10 mt-1 w-full"
      disabled={mutation.isPending}
      onClick={handleRegister}
      size="sm"
      type="button"
    >
      {mutation.isPending ? "Registering..." : "Register for event"}
    </Button>
  );

  return (
    <CatalogCard
      imageSlot={<EventImage alt={title} eventId={event.id} fallbackText={title} />}
      titleLink={
        <Link className={catalogCardLinkClass} params={{ id: event.id }} to="/events/$id">
          {title}
        </Link>
      }
    >
      {(formattedDate || capacityLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {formattedDate && (
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-primary">
              {formattedDate}
            </span>
          )}
          {capacityLabel && (
            <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground">
              <HugeiconsIcon className="h-3 w-3" icon={UserGroupIcon} />
              {capacityLabel}
            </span>
          )}
        </div>
      )}

      {locationLabel && (
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <HugeiconsIcon className="h-3 w-3" icon={Location01Icon} />
          <span className="line-clamp-1">{locationLabel}</span>
        </div>
      )}

      {winemakerName && (
        <p className="text-xs text-muted-foreground line-clamp-1">By {winemakerName}</p>
      )}

      {alreadyRegistered ? registeredCta : registerCta}
    </CatalogCard>
  );
}
