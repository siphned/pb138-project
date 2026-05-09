import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/dev/StubPage";

export const Route = createFileRoute("/shops/$id/inventory/$productId/edit")({
  component: ShopsInventoryEditStub,
});

function ShopsInventoryEditStub() {
  return (
    <StubPage title="Edit product" actorRole="shop_owner (owner)" hookName="useGetProductsById + usePutProductsById + useDeleteProductsById (MISSING BE)">
      <p className="text-destructive">
        Mutation hooks <code>usePutProductsById</code> and <code>useDeleteProductsById</code> not present in generated client.
        Backend endpoint missing or Orval has not regenerated. Recorded in audit.
      </p>
    </StubPage>
  );
}
