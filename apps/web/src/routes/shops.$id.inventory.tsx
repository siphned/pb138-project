import { createFileRoute } from "@tanstack/react-router";
import { StubGet } from "@/components/dev/StubGet";
import { useGetShopsByIdProducts } from "@/generated/hooks/useGetShopsByIdProducts";

export const Route = createFileRoute("/shops/$id/inventory")({
  component: ShopsInventoryStub,
  validateSearch: (search) => ({
    isBundle:
      search.isBundle === "true" ? true : search.isBundle === "false" ? false : undefined,
  }),
});

function ShopsInventoryStub() {
  const { id } = Route.useParams();
  const { isBundle } = Route.useSearch();
  const query = useGetShopsByIdProducts({ id, isBundle });
  return (
    <StubGet
      title={`Shop ${id} inventory`}
      role="shop_owner (owner)"
      hookName="useGetShopsByIdProducts"
      query={query}
    />
  );
}
