import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductDetailsCard } from "@/components/catalog/ProductDetailsCard";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { Separator } from "@/components/ui/separator";
import { useGetProductsById } from "@/generated/hooks/useGetProductsById";
import { usePostCartsItems } from "@/generated/hooks/usePostCartsItems";
import { ProductRelatedSection } from "./-components/ProductRelatedSection";
import { ProductReviewsSection } from "./-components/ProductReviewsSection";
import { ProductSoldAtCard } from "./-components/ProductSoldAtCard";

export const Route = createFileRoute("/products/$productId")({
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productId } = Route.useParams();
  const { data: product, isLoading, isError, refetch } = useGetProductsById(productId);
  const addToCartMutation = usePostCartsItems();

  const handleAddToCart = () => {
    addToCartMutation.mutate({ data: { productId, quantity: 1 } });
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
    <div className="container mx-auto space-y-12 px-6 py-8 lg:px-12">
      <Link
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        to="/products"
      >
        <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} />
        Back to products
      </Link>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_400px]">
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
        </div>

        <aside className="space-y-12">
          {product.shop && (
            <ProductSoldAtCard shopId={product.shop.id} shopName={product.shop.name} />
          )}

          <ProductReviewsSection productId={productId} />
        </aside>
      </div>
    </div>
  );
}
