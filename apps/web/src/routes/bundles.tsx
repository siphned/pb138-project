import { createFileRoute } from "@tanstack/react-router";
import { RouteStub } from "./-components/RouteStub";

export const Route = createFileRoute("/bundles")({
  component: BundlesPage,
});

function BundlesPage() {
  return <RouteStub title="Bundles" />;
}
