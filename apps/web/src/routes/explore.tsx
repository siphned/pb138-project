import { createFileRoute } from "@tanstack/react-router";
import { RouteStub } from "./-components/RouteStub";

export const Route = createFileRoute("/explore")({
  component: ExplorePage,
});

function ExplorePage() {
  return <RouteStub title="Explore Wines" />;
}
