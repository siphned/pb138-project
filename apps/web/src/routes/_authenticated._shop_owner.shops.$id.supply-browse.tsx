import { createFileRoute } from "@tanstack/react-router";
import { RouteStub } from "./-components/RouteStub";

export const Route = createFileRoute("/_authenticated/_shop_owner/shops/$id/supply-browse")({
  component: SupplyBrowsePage,
});

function SupplyBrowsePage() {
  return <RouteStub title="Browse Winemaker Supply" />;
}
