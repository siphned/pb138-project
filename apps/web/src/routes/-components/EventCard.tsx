import { Location01Icon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import type { MouseEvent } from "react";
import { CatalogCard, catalogCardLinkClass } from "@/components/catalog/CatalogCard";
import { EventImage } from "@/components/catalog/EventImage";
import { Button } from "@/components/ui/button";
import { usePostEventsByIdRegister } from "@/generated/hooks/usePostEventsByIdRegister";

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

function is409(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const maybe = error as { response?: { status?: number }; status?: number };
  return maybe.response?.status === 409 || maybe.status === 409;
}

export function EventCard({ event }: EventCardProps) {
  const title = event.title || event.name || "Untitled Event";
  const startDate = event.startDate ? new Date(event.startDate) : null;
  const formattedDate = startDate?.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const mutation = usePostEventsByIdRegister();
  const alreadyRegistered = mutation.isSuccess || is409(mutation.error);

  const handleRegister = (e: MouseEvent<HTMLButtonElement>) => {
    // Stop the stretched title-link from navigating to the detail page.
    e.preventDefault();
    e.stopPropagation();
    if (mutation.isPending) return;
    mutation.mutate({ id: event.id });
  };

  // When the user is already registered, the CTA navigates to the event detail
  // instead of being an inert disabled control (so the button area isn't a
  // dead zone covering the stretched title link).
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
      {formattedDate && (
        <span className="inline-block rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-primary">
          {formattedDate}
        </span>
      )}

      {event.location && (
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <HugeiconsIcon className="h-3 w-3" icon={Location01Icon} />
          <span className="line-clamp-1">{event.location}</span>
        </div>
      )}

      {event.winemakerName && (
        <p className="text-xs text-muted-foreground line-clamp-1">By {event.winemakerName}</p>
      )}

      {event.attendees !== undefined && (
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <HugeiconsIcon className="h-3 w-3" icon={UserGroupIcon} />
          <span>{event.attendees} attending</span>
        </div>
      )}

      {alreadyRegistered ? registeredCta : registerCta}
    </CatalogCard>
  );
}
