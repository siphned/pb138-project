import { Location01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import type { MouseEvent } from "react";
import { EventImage } from "@/components/catalog/EventImage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
    // Don't trigger the stretched-link navigation to event detail.
    e.preventDefault();
    e.stopPropagation();
    if (alreadyRegistered || mutation.isPending) return;
    mutation.mutate({ id: event.id });
  };

  let buttonLabel = "Register for event";
  if (alreadyRegistered) buttonLabel = "Already registered";
  else if (mutation.isPending) buttonLabel = "Registering...";

  return (
    <Card className="group relative" variant="polaroid">
      <div className="aspect-3/4 w-full overflow-hidden rounded-lg bg-muted shadow-xs">
        <EventImage alt={title} eventId={event.id} fallbackText={title} />
      </div>

      <div className="pt-4 text-center space-y-2">
        <h3 className="font-heading text-base font-bold leading-tight line-clamp-2">
          <Link
            className="stretched-link transition-colors hover:text-primary focus:outline-none"
            params={{ id: event.id }}
            to="/events/$id"
          >
            {title}
          </Link>
        </h3>

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

        <Button
          className="relative z-10 mt-3 w-full"
          disabled={alreadyRegistered || mutation.isPending}
          onClick={handleRegister}
          size="sm"
          type="button"
        >
          {buttonLabel}
        </Button>
      </div>
    </Card>
  );
}
