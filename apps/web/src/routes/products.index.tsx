import { createFileRoute } from "@tanstack/react-router";
import { StubGet } from "@/components/dev/StubGet";
import { useGetProducts } from "@/generated/hooks/useGetProducts";

export const Route = createFileRoute("/products/")({
  component: ProductsListStub,
  validateSearch: (search) => ({
    isBundle: typeof search.isBundle === "boolean" ? search.isBundle : undefined,
    q: typeof search.q === "string" ? search.q : undefined,
    shopId: typeof search.shopId === "string" ? search.shopId : undefined,
    wineId: typeof search.wineId === "string" ? search.wineId : undefined,
  }),
});

function ProductsListStub() {
  const search = Route.useSearch();
  const query = useGetProducts(search);
  return (
    <StubGet
      actorRole="guest+"
      hookName="useGetProducts"
      query={query}
      title={`All products${Object.keys(search).length ? " (filtered)" : ""}`}
    />
  );
}
