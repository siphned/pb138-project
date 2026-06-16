import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { PageHeader } from "@/components/primitives/page-header";
import { useGetProductsById } from "@/generated/hooks/useGetProductsById";
import { InventoryEditForm } from "@/routes/shops/$id/inventory/$productId/-components/InventoryEditForm";

export const Route = createFileRoute("/shops/$id/inventory/$productId/edit")({
  component: InventoryEditPage,
  // `returnTo=product` makes save/cancel land back on the product detail page
  // (used when editing from the product page's manage menu). Default: inventory.
  validateSearch: (search: Record<string, unknown>): { returnTo?: "product" } => ({
    returnTo: search.returnTo === "product" ? "product" : undefined,
  }),
});

function InventoryEditPage() {
  const { id, productId } = Route.useParams();
  const { returnTo } = Route.useSearch();
  const navigate = useNavigate();
  const { data: product, isLoading, isError, refetch } = useGetProductsById(productId);

  const goBack = () => {
    if (returnTo === "product") {
      navigate({ params: { productId }, to: "/products/$productId" });
    } else {
      navigate({ params: { id }, search: { isBundle: undefined }, to: "/shops/$id/inventory" });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-8 lg:px-12">
        <LoadingState variant="detail" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto px-6 py-8 lg:px-12">
        <ErrorState
          message="We couldn't load the product to edit."
          onRetry={() => refetch()}
          title="Product not found"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <button
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        onClick={goBack}
        type="button"
      >
        <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} />
        {returnTo === "product" ? "Back to product" : "Back to inventory"}
      </button>

      <PageHeader
        description="Update the product name, price, quantity, or description."
        title="Edit product"
      />

      <InventoryEditForm onCancel={goBack} onSuccess={goBack} product={product} shopId={id} />
    </div>
  );
}
