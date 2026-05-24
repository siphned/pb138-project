import { createFileRoute } from "@tanstack/react-router";
import { RouteStub } from "./-components/RouteStub";

export const Route = createFileRoute("/_authenticated/_shop_owner/manage/shops/$id/shop-orders")({
  component: ShopOrdersPage,
});

function ShopOrdersPage() {
  return <RouteStub title="Shop Orders" />;
}
