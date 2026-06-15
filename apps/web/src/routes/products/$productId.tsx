import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { getCartsQueryKey } from "@/generated/hooks/useGetCarts";
import { useGetProductsById } from "@/generated/hooks/useGetProductsById";
import { useGetProductsByIdImages } from "@/generated/hooks/useGetProductsByIdImages";
import { usePostCartsItems } from "@/generated/hooks/usePostCartsItems";
import { BundleWinesSection } from "@/routes/products/-components/BundleWinesSection";
import { ProductDetailsCard } from "@/routes/products/-components/ProductDetailsCard";
import { ProductGallery } from "@/routes/products/-components/ProductGallery";
import { ProductRelatedSection } from "@/routes/products/-components/ProductRelatedSection";
import { ProductReviewsSection } from "@/routes/products/-components/ProductReviewsSection";
import { ProductSoldAtCard } from "@/routes/products/-components/ProductSoldAtCard";

export const Route = createFileRoute("/products/$productId")({
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productId } = Route.useParams();
  const queryClient = useQueryClient();
  const { data: product, isLoading, isError, refetch } = useGetProductsById(productId);
  const { data: productImages } = useGetProductsByIdImages(productId);
  const addToCartMutation = usePostCartsItems();

  const handleAddToCart = (quantity: number) => {
    addToCartMutation.mutate(
      { data: { productId, quantity } },
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
    <div className="container mx-auto space-y-12 px-6 py-8 lg:px-12">
      <Link
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        to="/products"
      >
        <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} />
        Back to products
      </Link>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <div>
          <ProductGallery
            images={productImages?.map((img) => img.url)}
            productName={product.name}
          />
        </div>

        <ProductDetailsCard
          isAddingToCart={addToCartMutation.isPending}
          onAddToCart={handleAddToCart}
          product={product}
        />
      </div>

      {product.shop && <ProductSoldAtCard shopId={product.shop.id} shopName={product.shop.name} />}

      {product.isBundle && <BundleWinesSection productWines={product.productWines} />}

      <ProductRelatedSection
        isBundle={!!product.isBundle}
        shopId={product.shopId}
        // biome-ignore lint/suspicious/noExplicitAny: productWines.wine shape is too narrow in OpenAPI (track in BE follow-up)
        wines={product.productWines?.map((pw: any) => pw.wine) || []}
      />

      <ProductReviewsSection productId={productId} />
    </div>
  );
}
