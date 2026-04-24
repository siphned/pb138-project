import { createFileRoute } from "@tanstack/react-router";
import { RouteStub } from "./-components/RouteStub";

export const Route = createFileRoute("/events")({
  component: EventsPage,
});

function EventsPage() {
  return <RouteStub title="Events" />;
}
