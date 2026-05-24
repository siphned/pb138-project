import { createFileRoute } from "@tanstack/react-router";
import { StubMutation } from "@/components/dev/StubMutation";
import { usePatchEventsById } from "@/generated/hooks/usePatchEventsById";

export const Route = createFileRoute("/events/$id/edit")({
  component: EventEditStub,
});

function EventEditStub() {
  const { id } = Route.useParams();
  const mutation = usePatchEventsById();
  return (
    <StubMutation
      actorRole="winemaker"
      hookName="usePatchEventsById"
      mutation={mutation}
      payloadExample={{ data: { name: "Updated Title" }, id }}
      title={`Edit event ${id}`}
    />
  );
}
