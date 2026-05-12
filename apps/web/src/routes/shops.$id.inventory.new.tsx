import { createFileRoute } from "@tanstack/react-router";
import { StubMutation } from "@/components/dev/StubMutation";
import { usePostShopsByIdProducts } from "@/generated/hooks/usePostShopsByIdProducts";

export const Route = createFileRoute("/shops/$id/inventory/new")({
  component: ShopsInventoryNewStub,
});

function ShopsInventoryNewStub() {
  const { id } = Route.useParams();
  const mutation = usePostShopsByIdProducts();
  return (
    <StubMutation
      actorRole="shop_owner (owner)"
      hookName="usePostShopsByIdProducts"
      mutation={mutation}
      payloadExample={{ data: { price: 29.99, stock: 12, wineId: "WINE_ID" }, id }}
      title={`Create product at shop ${id}`}
    />
  );
}
