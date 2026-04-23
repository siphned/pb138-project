import { createFileRoute } from "@tanstack/react-router";
import { RouteStub } from "./-components/RouteStub";

export const Route = createFileRoute("/search")({
  component: SearchPage,
});

function SearchPage() {
  return <RouteStub title="Search" />;
}
