import { createFileRoute } from "@tanstack/react-router";
import { StubGet } from "@/components/dev/StubGet";
import { useGetProducts } from "@/generated/hooks/useGetProducts";

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
  const query = useGetProducts({ isBundle, shopId: id });
  return (
    <StubGet
      actorRole="shop_owner (owner)"
      hookName="useGetProducts"
      query={query}
      title={`Shop ${id} inventory`}
    />
  );
}
