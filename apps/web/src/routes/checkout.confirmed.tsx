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
  const query = useGetOrdersById(orderId);
  if (!orderId) {
    return (
      <StubPage actorRole="customer+" hookName="useGetOrdersById" title="Checkout confirmed">
        <p>
          Missing <code>?orderId=</code> search param.
        </p>
      </StubPage>
    );
  }
  return (
    <StubGet
      actorRole="customer+"
      hookName="useGetOrdersById"
      query={query}
      title={`Order ${orderId} — confirmed`}
    />
  );
}
