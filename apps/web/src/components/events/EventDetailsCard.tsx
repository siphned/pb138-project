import { DescriptionList, PropertyRow } from "@/components/primitives/description-list";
import { Section } from "@/components/primitives/section";
import { Card, CardContent } from "@/components/ui/card";
import { EventRegistrationButton } from "./EventRegistrationButton";

export interface EventDetailsCardEvent {
  id: string;
  description?: string | null;
  startDate?: string | Date;
  endDate?: string | Date;
  location?: string;
  capacity?: number | null;
  attendees?: number;
  isRegisteredByMe?: boolean;
}

interface EventDetailsCardProps {
  event: EventDetailsCardEvent;
}

function formatDateTime(value?: string | Date) {
  if (!value) return null;
  const date = new Date(value);
  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function EventDetailsCard({ event }: EventDetailsCardProps) {
  const startLabel = formatDateTime(event.startDate);
  const endLabel = formatDateTime(event.endDate);

  return (
    <Section heading="About this event">
      <Card variant="default">
        <CardContent className="space-y-6 pt-6">
          <DescriptionList>
            {startLabel && <PropertyRow label="Starts" value={startLabel} />}
            {endLabel && <PropertyRow label="Ends" value={endLabel} />}
            {event.location && <PropertyRow label="Location" value={event.location} />}
            {event.capacity !== undefined && event.capacity !== null && (
              <PropertyRow label="Capacity" value={String(event.capacity)} />
            )}
            {event.attendees !== undefined && (
              <PropertyRow label="Attending" value={`${event.attendees} people`} />
            )}
          </DescriptionList>

          {event.description && (
            <p className="text-sm leading-relaxed text-muted-foreground">{event.description}</p>
          )}

          <EventRegistrationButton
            eventId={event.id}
            isRegistered={event.isRegisteredByMe}
          />
        </CardContent>
      </Card>
    </Section>
  );
}
