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
      actorRole="shop_owner"
      hookName="usePostShopsByIdProducts"
      mutation={mutation}
      payloadExample={{
        data: { name: "New Product", price: "299", quantity: 10, wineId: "wine-uuid" },
        id: shopId,
      }}
      title="Create new product"
    />
  );
}
