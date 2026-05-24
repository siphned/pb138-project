import { createFileRoute } from "@tanstack/react-router";
import { RouteStub } from "./-components/RouteStub";

export const Route = createFileRoute("/_authenticated/_winemaker/supply")({
  component: SupplyPage,
});

function SupplyPage() {
  return <RouteStub title="Supply Requests" />;
}
