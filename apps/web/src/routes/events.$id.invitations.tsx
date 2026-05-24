import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/dev/StubPage";

export const Route = createFileRoute("/events/$id/invitations")({
  component: EventsInvitationsStub,
});

function EventsInvitationsStub() {
  return (
    <StubPage
      actorRole="winemaker (owner)"
      hookName="useGetEventsByIdInvitations (MISSING BE)"
      title="Event invitations"
    >
      <p className="text-destructive">
        Hook <code>useGetEventsByIdInvitations</code> not present in generated client. Backend
        endpoint missing or Orval has not regenerated. Recorded in audit.
      </p>
    </StubPage>
  );
}
