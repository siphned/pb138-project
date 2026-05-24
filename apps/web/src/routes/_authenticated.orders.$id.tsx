import { createFileRoute } from "@tanstack/react-router";
import { StubGet } from "@/components/dev/StubGet";
import { useGetOrdersById } from "@/generated/hooks/useGetOrdersById";

export const Route = createFileRoute("/_authenticated/orders/$id")({
  component: OrdersDetailStub,
});

function OrdersDetailStub() {
  const { id } = Route.useParams();
  const query = useGetOrdersById(id);
  return (
    <StubGet
      actorRole="customer+"
      hookName="useGetOrdersById"
      query={query}
      title={`Order ${id}`}
    />
  );
}
