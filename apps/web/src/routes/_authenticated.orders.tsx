import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/dev/StubPage";

export const Route = createFileRoute("/_authenticated/orders")({
  component: OrdersListStub,
});

function OrdersListStub() {
  return (
    <StubPage actorRole="customer+" hookName="useGetOrders (MISSING BE)" title="My orders">
      <p className="text-destructive">
        Hook <code>useGetOrders</code> / <code>useGetOrdersMe</code> not present in generated
        client. BE list endpoint missing — see audit. To browse a single order, use{" "}
        <code>/orders/$id</code>.
      </p>
    </StubPage>
  );
}
