import { createFileRoute } from "@tanstack/react-router";
import { RouteStub } from "./-components/RouteStub";

export const Route = createFileRoute("/_authenticated/_shop_owner/shops/$id/bundles")({
  component: BundlesPage,
});

function BundlesPage() {
  return <RouteStub title="Bundles" />;
}
