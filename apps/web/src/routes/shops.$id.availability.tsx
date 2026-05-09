import { createFileRoute } from "@tanstack/react-router";
import { StubGet } from "@/components/dev/StubGet";
import { useGetShopsByIdAvailability } from "@/generated/hooks/useGetShopsByIdAvailability";

export const Route = createFileRoute("/shops/$id/availability")({
  component: ShopsAvailabilityStub,
});

function ShopsAvailabilityStub() {
  const { id } = Route.useParams();
  const query = useGetShopsByIdAvailability({ id });
  return (
    <StubGet
      title={`Shop ${id} availability`}
      role="shop_owner (owner)"
      hookName="useGetShopsByIdAvailability"
      query={query}
    />
  );
}
