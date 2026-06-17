import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/dev/StubPage";

export const Route = createFileRoute("/shops/$id/orders")({
  component: ShopsOrdersStub,
});

function ShopsOrdersStub() {
  return (
    <StubPage
      actorRole="shop_owner (owner)"
      hookName="useGetOrdersByShopId (MISSING BE)"
      title="Shop orders"
    >
      <p className="text-destructive">
        Hook <code>useGetOrdersByShopId</code> not present in generated client. Backend endpoint
        missing or Orval has not regenerated. Recorded in audit.
      </p>
    </StubPage>
  );
}
