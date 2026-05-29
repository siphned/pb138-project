import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { PageHeader } from "@/components/primitives/page-header";
import { InventoryEditForm } from "@/components/shops/InventoryEditForm";
import { useGetProductsById } from "@/generated/hooks/useGetProductsById";

export const Route = createFileRoute("/shops/$id/inventory/$productId/edit")({
  component: InventoryEditPage,
});

function InventoryEditPage() {
  const { id, productId } = Route.useParams();
  const navigate = useNavigate();
  const { data: product, isLoading, isError, refetch } = useGetProductsById(productId);

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
      <Link
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        params={{ id }}
        search={{ isBundle: undefined }}
        to="/shops/$id/inventory"
      >
        <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} />
        Back to inventory
      </Link>

      <PageHeader description="Update the product name, price, quantity, or description." title="Edit product" />

      <InventoryEditForm
        onSuccess={() =>
          navigate({ params: { id }, search: { isBundle: undefined }, to: "/shops/$id/inventory" })
        }
        product={product}
        shopId={id}
      />
    </div>
  );
}
