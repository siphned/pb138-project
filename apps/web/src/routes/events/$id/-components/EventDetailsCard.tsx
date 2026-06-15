import {
  Building02Icon,
  Calendar03Icon,
  MapPinIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { EventRegistrationButton } from "@/routes/events/$id/-components/EventRegistrationButton";

export interface EventDetailsCardEvent {
  id: string;
  description?: string | null;
  startTime?: string | Date;
  endTime?: string | Date;
  startDate?: string | Date;
  endDate?: string | Date;
  capacity?: number | null;
  attendees?: number;
  isRegisteredByMe?: boolean;
  address?: {
    street?: string;
    houseNumber?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  } | null;
  winemaker?: { id?: string; name?: string } | null;
  winemakerName?: string;
  winemakerId?: string;
}

interface EventDetailsCardProps {
  event: EventDetailsCardEvent;
}

function formatDateTime(value?: string | Date) {
  if (!value) return null;
  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDateRange(
  start?: string | Date,
  end?: string | Date
): { start: string | null; end: string | null } {
  return { end: formatDateTime(end), start: formatDateTime(start) };
}

interface TabletProps {
  icon: typeof Calendar03Icon;
  label: string;
  children: React.ReactNode;
}

function Tablet({ icon, label, children }: TabletProps) {
  return (
    <div className="space-y-3 rounded-md border border-border p-4">
      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{label}</h3>
      <div className="flex items-start gap-3 text-sm">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <HugeiconsIcon className="h-4 w-4" icon={icon} />
        </div>
        <div className="font-medium text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: event details card renders multiple conditional sections (status, times, location, registration) in one component
export function EventDetailsCard({ event }: EventDetailsCardProps) {
  const { start, end } = formatDateRange(
    event.startTime ?? event.startDate,
    event.endTime ?? event.endDate
  );

  const hostName = event.winemaker?.name ?? event.winemakerName;
  const hostId = event.winemaker?.id ?? event.winemakerId;

  const capacity = event.capacity ?? null;
  const attendees = event.attendees ?? 0;
  const spotsRemaining = capacity !== null ? Math.max(capacity - attendees, 0) : null;

  const a = event.address;
  const addressLines = a
    ? [
        [a.street, a.houseNumber].filter(Boolean).join(" "),
        [a.postalCode, a.city].filter(Boolean).join(" "),
        a.country,
      ].filter((line) => line && line.trim() !== "")
    : [];

  return (
    <div className="space-y-8" data-slot="event-details-sidebar">
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-heading">About this event</h2>
        <div className="prose prose-sm dark:prose-invert">
          <p className="text-muted-foreground leading-relaxed">
            {event.description ? event.description : "No description available."}
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {hostName && (
          <Tablet icon={Building02Icon} label="Hosted by">
            {hostId ? (
              <Link
                className="font-medium text-primary hover:underline"
                params={{ id: hostId }}
                to="/winemakers/$id"
              >
                {hostName}
              </Link>
            ) : (
              <span className="font-medium text-foreground">{hostName}</span>
            )}
          </Tablet>
        )}

        {addressLines.length > 0 && (
          <Tablet icon={MapPinIcon} label="Location">
            {addressLines.map((line) => (
              <div key={line}>{line}</div>
            ))}
          </Tablet>
        )}

        {(start || end) && (
          <Tablet icon={Calendar03Icon} label="Date & Time">
            {start && <div>Starts: {start}</div>}
            {end && <div>Ends: {end}</div>}
          </Tablet>
        )}

        {capacity !== null && (
          <Tablet icon={UserGroupIcon} label="Capacity">
            <div>{capacity} total spots</div>
            {spotsRemaining !== null && (
              <div className="text-foreground">
                <span className="font-bold">{spotsRemaining}</span> of {capacity} spots remaining
              </div>
            )}
            <div className="text-xs">{attendees} attending</div>
          </Tablet>
        )}
      </div>

      <EventRegistrationButton eventId={event.id} isRegistered={event.isRegisteredByMe} />
    </div>
  );
}
