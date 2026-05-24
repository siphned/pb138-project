import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductDetailsCard } from "@/components/catalog/ProductDetailsCard";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { Separator } from "@/components/ui/separator";
import { getCartsQueryKey } from "@/generated/hooks/useGetCarts";
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
=======
  const { data, isLoading, isError, refetch } = useGetProductsById(productId);
  const { data: reviewData, isLoading: reviewsLoading } = useGetReviewsProductById(productId);

  if (isLoading) return <ProductPageSkeleton />;

  if (isError || !data) {
    return (
      <PublicLayout>
        <div className="container mx-auto flex flex-col items-center py-24 text-center">
          <p className="font-bold text-destructive">Failed to load product details.</p>
          <Button onClick={() => refetch()} variant="link">
            Retry
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const product = toProductDetail(data);

  return (
    <PublicLayout>
      <div className="container mx-auto px-6 py-8 lg:px-12 space-y-8">
        <Link
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          search={{ page: 1, sort: "newest" }}
          to="/wines"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to catalog
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <ProductGallery productName={product.name} />

          <div className="space-y-6">
            <div className="space-y-6">
              <ProductInfo
                isBundle={product.isBundle}
                name={product.name}
                rating={reviewData?.averageRating ?? undefined}
                reviewCount={reviewData?.reviews?.length}
                wines={product.wines}
              />

              {product.description && (
                <ProductDescriptionCard
                  description={product.description}
                  isBundle={product.isBundle}
                />
              )}
            </div>

            <div className="space-y-4">
              <div className="lg:sticky lg:top-8 space-y-4">
                <ProductPriceRow
                  price={product.price}
                  productId={product.id}
                  quantity={product.quantity}
                />

                {product.shopId && (
                  <ProductSoldAtCard shopId={product.shopId} shopName={product.shop?.name} />
                )}

                {!product.isBundle && product.wines[0]?.winemaker?.id && (
                  <ProductWinemakerCard
                    winemakerId={product.wines[0].winemaker.id}
                    winemakerName={product.wines[0].winemaker.name}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <ProductRelatedSection
          isBundle={product.isBundle}
          shopId={product.shopId}
          wines={product.wines}
        />

        <Separator />

        <ProductReviewsSection isLoading={reviewsLoading} reviewData={reviewData} />
      </div>
    </PublicLayout>
>>>>>>> origin/main
  );
}
