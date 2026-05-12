import { createFileRoute } from "@tanstack/react-router";
import { StubGet } from "@/components/dev/StubGet";
import { useGetShopsByIdProducts } from "@/generated/hooks/useGetShopsByIdProducts";

function parseIsBundle(v: unknown): boolean | undefined {
  if (v === "true") return true;
  if (v === "false") return false;
  return undefined;
}

export const Route = createFileRoute("/shops/$id/inventory")({
  component: ShopsInventoryStub,
  validateSearch: (search) => ({
    isBundle: parseIsBundle(search.isBundle),
  }),
});

function ShopsInventoryStub() {
  const { id } = Route.useParams();
  const { isBundle } = Route.useSearch();
  const query = useGetShopsByIdProducts({ id, isBundle });
  return (
    <StubGet
      actorRole="shop_owner (owner)"
      hookName="useGetShopsByIdProducts"
      query={query}
      title={`Shop ${id} inventory`}
    />
  );
}
