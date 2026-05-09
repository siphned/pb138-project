import { createFileRoute } from "@tanstack/react-router";
import { StubGet } from "@/components/dev/StubGet";
import { StubPage } from "@/components/dev/StubPage";
import { useGetOrdersById } from "@/generated/hooks/useGetOrdersById";

export const Route = createFileRoute("/checkout/confirmed")({
  component: CheckoutConfirmedStub,
  validateSearch: (search) => ({
    orderId: typeof search.orderId === "string" ? search.orderId : "",
  }),
});

function CheckoutConfirmedStub() {
  const { orderId } = Route.useSearch();
  const query = useGetOrdersById({ id: orderId });
  if (!orderId) {
    return (
      <StubPage title="Checkout confirmed" actorRole="customer+" hookName="useGetOrdersById">
        <p>Missing <code>?orderId=</code> search param.</p>
      </StubPage>
    );
  }
  return (
    <StubGet
      title={`Order ${orderId} — confirmed`}
      actorRole="customer+"
      hookName="useGetOrdersById"
      query={query}
    />
  );
}
