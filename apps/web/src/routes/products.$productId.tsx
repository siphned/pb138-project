import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductDetailsCard } from "@/components/catalog/ProductDetailsCard";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { PageHeader } from "@/components/primitives/page-header";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getCartsQueryKey } from "@/generated/hooks/useGetCarts";
import { useGetProductsById } from "@/generated/hooks/useGetProductsById";
import { usePostCartsItems } from "@/generated/hooks/usePostCartsItems";
import { ProductRelatedSection } from "./-components/ProductRelatedSection";
import { ProductReviewsSection } from "./-components/ProductReviewsSection";

export const Route = createFileRoute("/products/$productId")({
  component: ProductDetailPage,
});

function stockBadge(quantity: number) {
  if (quantity === 0) return { label: "Out of stock", variant: "destructive" as const };
  if (quantity <= 5) return { label: `Only ${quantity} left`, variant: "warning" as const };
  return { label: "In stock", variant: "success" as const };
}

function ProductDetailPage() {
  const { productId } = Route.useParams();
  const queryClient = useQueryClient();
  const { data: product, isLoading, isError, refetch } = useGetProductsById(productId);
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

  const stock = stockBadge(product.quantity);

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <Link
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        to="/products"
      >
        <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} />
        All products
      </Link>

      <div className="space-y-3">
        <PageHeader title={product.name} />
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {product.shop && (
            <>
              <span>Sold by</span>
              <Link
                className="font-medium text-foreground transition-colors hover:text-primary"
                params={{ id: product.shop.id }}
                to="/shops/$id"
              >
                {product.shop.name}
              </Link>
            </>
          )}
          <span className="text-muted-foreground/40">·</span>
          <Badge variant={stock.variant}>{stock.label}</Badge>
          {product.isBundle && <Badge variant="secondary">Bundle</Badge>}
        </div>
      </div>

      <div className="space-y-12">
        <ProductDetailsCard
          isAddingToCart={addToCartMutation.isPending}
          onAddToCart={handleAddToCart}
          product={product}
        />

        {!product.isBundle && (
          <>
            <Separator />
            <ProductRelatedSection
              isBundle={false}
              shopId={product.shopId}
              // biome-ignore lint/suspicious/noExplicitAny: productWines.wine shape is too narrow in OpenAPI (track in BE follow-up)
              wines={product.productWines?.map((pw: any) => pw.wine) || []}
            />
          </>
        )}

        <Separator />

        <ProductReviewsSection productId={productId} />
      </div>
    </div>
  );
}
