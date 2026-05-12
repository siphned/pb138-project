import { createFileRoute } from "@tanstack/react-router";
import { StubGet } from "@/components/dev/StubGet";
import { useGetAdminEvents } from "@/generated/hooks/useGetAdminEvents";

export const Route = createFileRoute("/_authenticated/_admin/events")({
  component: AdminEventsStub,
});

function AdminEventsStub() {
  const query = useGetAdminEvents();
  return (
    <StubGet
      actorRole="admin"
      hookName="useGetAdminEvents"
      query={query}
      title="Admin: All events"
    />
  );
}
