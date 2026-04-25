import { createFileRoute } from "@tanstack/react-router";
import { RouteStub } from "./-components/RouteStub";

export const Route = createFileRoute("/_authenticated/_shop_owner/shops/$id/inventory")({
  component: InventoryPage,
});

function InventoryPage() {
  return <RouteStub title="Retail Inventory" />;
}
