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
      title={`Create product at shop ${id}`}
      actorRole="shop_owner (owner)"
      hookName="usePostShopsByIdProducts"
      mutation={mutation}
      payloadExample={{ id, data: { wineId: "WINE_ID", price: 29.99, stock: 12 } }}
    />
  );
}
