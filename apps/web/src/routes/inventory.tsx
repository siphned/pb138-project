import { createFileRoute } from "@tanstack/react-router";
import { RouteStub } from "./-components/RouteStub";

export const Route = createFileRoute("/inventory")({
  component: InventoryPage,
});

function InventoryPage() {
  return <RouteStub title="My Wines" />;
}
