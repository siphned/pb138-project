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
      title={`Edit event ${id}`}
      role="winemaker"
      hookName="usePatchEventsById"
      mutation={mutation}
      payloadExample={{ id, data: { title: "Updated Title" } }}
    />
  );
}
