import { createFileRoute } from "@tanstack/react-router";
import { StubMutation } from "@/components/dev/StubMutation";
import { usePostEvents } from "@/generated/hooks/usePostEvents";

export const Route = createFileRoute("/events/new")({
  component: EventCreateStub,
});

function EventCreateStub() {
  const mutation = usePostEvents();
  return (
    <StubMutation
      actorRole="winemaker"
      hookName="usePostEvents"
      mutation={mutation}
      payloadExample={{
        data: { date: "2026-06-01T18:00:00Z", location: "Cellar", title: "Wine Tasting" },
      }}
      title="Create new event"
    />
  );
}
