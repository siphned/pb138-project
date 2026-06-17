import { Location01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUser } from "@/context/UserContext";
import { getEventsQueryKey } from "@/generated/hooks/useGetEvents";
import { getEventsByIdQueryKey } from "@/generated/hooks/useGetEventsById";
import { usePostEventsByIdRegister } from "@/generated/hooks/usePostEventsByIdRegister";
import { parseApiError } from "@/lib/api-errors";
import { EventImage } from "@/routes/-components/EventImage";

interface EventCardProps {
  event: {
    id: string;
    title?: string;
    name?: string;
    description?: string | null;
    startTime?: string | Date;
    startDate?: string | Date;
    endDate?: string | Date;
    location?: string;
    winemakerName?: string;
    winemakerId?: string;
    isRegisteredByMe?: boolean;
    imageUrl?: string | null;
  };
}

function formatShortDate(value?: string | Date) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function friendlyMessage(code?: string, fallback?: string): string {
  switch (code) {
    case "ALREADY_REGISTERED":
      return "You're already registered.";
    case "CAPACITY_FULL":
      return "Event is full.";
    case "EVENT_NOT_AVAILABLE":
      return "Registration closed.";
    case "EVENT_NOT_FOUND":
      return "Event not found.";
    default:
      return fallback ?? "Something went wrong.";
  }
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: event card handles registration state, error display, and conditional rendering in one component
export function EventCard({ event }: EventCardProps) {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const registerMutation = usePostEventsByIdRegister();

  const title = event.title || event.name || "Untitled Event";
  const startValue = event.startTime ?? event.startDate;
  const dateLabel = formatShortDate(startValue);
  const hasStarted = startValue ? new Date(startValue).getTime() < Date.now() : false;

  const apiError = parseApiError(registerMutation.error);
  const isAlreadyRegistered = apiError?.code === "ALREADY_REGISTERED";
  const isRegistered =
    !!event.isRegisteredByMe || registerMutation.isSuccess || isAlreadyRegistered;
  const pending = registerMutation.isPending;
  const canRegister = !!user && !isRegistered && !hasStarted;

  let buttonLabel = "Register";
  if (hasStarted) buttonLabel = "Registration closed";
  else if (isRegistered) buttonLabel = "Registered";
  else if (pending) buttonLabel = "Registering…";

  const handleRegister = () => {
    if (!canRegister) return;
    registerMutation.mutate(
      { id: event.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getEventsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getEventsByIdQueryKey(event.id) });
        },
      }
    );
  };

  const showError = !!apiError && !isRegistered;

  return (
    <Card className="group relative" variant="polaroid">
      <div className="relative aspect-3/4 w-full overflow-hidden rounded-lg bg-muted shadow-xs">
        <EventImage alt={title} eventId={event.id} fallbackText={title} imageUrl={event.imageUrl} />

        {dateLabel && (
          <div className="absolute top-2 left-2 z-10">
            <span className="rounded-md bg-background/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground shadow-sm backdrop-blur">
              {dateLabel}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col space-y-2 pt-4 text-center">
        <h3 className="font-heading text-base font-bold leading-tight line-clamp-2">
          <Link
            className="stretched-link transition-colors hover:text-primary focus:outline-none"
            params={{ id: event.id }}
            to="/events/$id"
          >
            {title}
          </Link>
        </h3>

        {(event.location || event.winemakerName) && (
          <p className="flex flex-wrap items-center justify-center gap-x-1 gap-y-0.5 text-xs text-muted-foreground">
            {event.location && (
              <span className="inline-flex items-center gap-1">
                <HugeiconsIcon aria-hidden className="h-3 w-3" icon={Location01Icon} />
                <span className="line-clamp-1">{event.location}</span>
              </span>
            )}
            {event.location && event.winemakerName && <span>·</span>}
            {event.winemakerName && <span className="line-clamp-1">{event.winemakerName}</span>}
          </p>
        )}

        <div className="relative z-10 mt-auto space-y-1 pt-2">
          <Button
            className="w-full"
            disabled={isRegistered || pending || !user || hasStarted}
            onClick={handleRegister}
            size="sm"
            variant={isRegistered || hasStarted ? "outline" : "default"}
          >
            {buttonLabel}
          </Button>
          {showError && (
            <p className="text-xs text-destructive" role="alert">
              {friendlyMessage(apiError.code, apiError.message)}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
