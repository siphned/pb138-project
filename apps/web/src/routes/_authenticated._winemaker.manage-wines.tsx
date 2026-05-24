import { createFileRoute } from "@tanstack/react-router";
import { RouteStub } from "./-components/RouteStub";

export const Route = createFileRoute("/_authenticated/_winemaker/manage-wines")({
  component: WinesPage,
});

function WinesPage() {
  return <RouteStub title="My Wine Catalog" />;
}
