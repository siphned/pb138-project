import { createFileRoute } from "@tanstack/react-router";
import { StubMutation } from "@/components/dev/StubMutation";
import { usePostShopsByIdProducts } from "@/generated/hooks/usePostShopsByIdProducts";

export const Route = createFileRoute("/products/new")({
  component: ProductCreateStub,
  validateSearch: (search) => ({
    shopId: typeof search.shopId === "string" ? search.shopId : "",
  }),
});

function ProductCreateStub() {
  const { shopId } = Route.useSearch();
  const mutation = usePostShopsByIdProducts();
  return (
    <StubMutation
      title="Create new product"
      role="shop_owner"
      hookName="usePostShopsByIdProducts"
      mutation={mutation}
      payloadExample={{ id: shopId, data: { wineId: "wine-uuid", price: 299, stock: 10 } }}
    />
  );
}
