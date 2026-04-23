import { createFileRoute } from "@tanstack/react-router";
import { RouteStub } from "./-components/RouteStub";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  return <RouteStub title="Shopping Cart" />;
}
