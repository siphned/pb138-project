import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductDetailsCard } from "@/components/catalog/ProductDetailsCard";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { PageHeader } from "@/components/primitives/page-header";
import { Separator } from "@/components/ui/separator";
import { getCartsQueryKey } from "@/generated/hooks/useGetCarts";
import { useGetProductsById } from "@/generated/hooks/useGetProductsById";
import { usePostCartsItems } from "@/generated/hooks/usePostCartsItems";
import { ProductRelatedSection } from "./-components/ProductRelatedSection";
import { ProductReviewsSection } from "./-components/ProductReviewsSection";

export const Route = createFileRoute("/products/$productId")({
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productId } = Route.useParams();
  const queryClient = useQueryClient();
  const { data: product, isLoading, isError, refetch } = useGetProductsById(productId);
  const addToCartMutation = usePostCartsItems();

  const handleAddToCart = () => {
    addToCartMutation.mutate(
      { data: { productId, quantity: 1 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getCartsQueryKey() });
        },
      }
    );
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
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <Link
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        to="/products"
      >
        <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} />
        All products
      </Link>

      <PageHeader description={product.shop?.name} title={product.name} />

      <div className="space-y-12">
        <ProductDetailsCard
          isAddingToCart={addToCartMutation.isPending}
          onAddToCart={handleAddToCart}
          product={product}
        />

        <Separator />

        <ProductRelatedSection
          isBundle={!!product.isBundle}
          shopId={product.shopId}
          // biome-ignore lint/suspicious/noExplicitAny: productWines.wine shape is too narrow in OpenAPI (track in BE follow-up)
          wines={product.productWines?.map((pw: any) => pw.wine) || []}
        />

        <Separator />

        <ProductReviewsSection productId={productId} />
      </div>
    </div>
  );
}
