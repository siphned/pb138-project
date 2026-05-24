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
        data: {
          address: {
            city: "Velké Bílovice",
            country: "Czech Republic",
            houseNumber: "1",
            postalCode: "69102",
            street: "Cellar Street",
          },
          capacity: 50,
          endTime: "2026-06-01T22:00:00Z",
          inviteType: "open",
          name: "Wine Tasting",
          startTime: "2026-06-01T18:00:00Z",
          visibility: "public",
        },
      }}
      title="Create new event"
    />
  );
}
