import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useGetProductsById } from "@/generated/hooks/useGetProductsById";
import { useGetProductsByIdReviews } from "@/generated/hooks/useGetProductsByIdReviews";
import { ProductDescriptionCard } from "./-components/ProductDescriptionCard";
import { ProductGallery } from "./-components/ProductGallery";
import { ProductInfo } from "./-components/ProductInfo";
import { ProductPageSkeleton } from "./-components/ProductPageSkeleton";
import { ProductPriceRow } from "./-components/ProductPriceRow";
import { ProductRelatedSection } from "./-components/ProductRelatedSection";
import { ProductReviewsSection } from "./-components/ProductReviewsSection";
import { ProductSoldAtCard } from "./-components/ProductSoldAtCard";
import { ProductWinemakerCard } from "./-components/ProductWinemakerCard";

type RawProductDetail = {
  id: string;
  name: string;
  description?: string | null;
  price?: string;
  quantity?: number;
  isBundle?: boolean;
  shopId?: string;
  shop?: { id: string; name: string };
  // GET /products/:id returns productWines, not wines
  productWines?: {
    wine: {
      id: string;
      name: string;
      type: string;
      color: string;
      vintageYear: number;
      // region and winemaker not returned by findById — backend gap
      region?: string;
      winemaker?: { id: string; name: string };
    };
  }[];
};

function toProductDetail(raw: RawProductDetail) {
  return {
    description: raw.description ?? null,
    id: raw.id,
    isBundle: !!raw.isBundle,
    name: raw.name,
    price: raw.price ?? "0",
    quantity: Number(raw.quantity ?? 0),
    shop: raw.shop,
    shopId: raw.shopId ?? "",
    wines: (raw.productWines ?? []).map((pw) => ({
      color: pw.wine.color,
      id: pw.wine.id,
      name: pw.wine.name,
      region: pw.wine.region ?? "",
      type: pw.wine.type,
      vintageYear: Number(pw.wine.vintageYear),
      winemaker: pw.wine.winemaker ?? { id: "", name: "" },
    })),
  };
}

export const Route = createFileRoute("/products/$productId")({
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productId } = Route.useParams();
  const { data, isLoading, isError, refetch } = useGetProductsById(productId);
  const { data: reviewData, isLoading: reviewsLoading } = useGetProductsByIdReviews(productId);

  if (isLoading) return <ProductPageSkeleton />;

  if (isError || !data) {
    return (
      <div className="container mx-auto flex flex-col items-center py-24 text-center">
        <p className="font-bold text-destructive">Failed to load product details.</p>
        <Button onClick={() => refetch()} variant="link">
          Retry
        </Button>
      </div>
    );
  }

  const product = toProductDetail(data);

  return (
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

      {/* [STUB] hook audit */}
      <details className="container mx-auto p-6">
        <summary className="cursor-pointer font-mono text-sm">[STUB] hook audit</summary>
        <ProductDetailStubAudit />
      </details>
    </div>
  );
}

function ProductDetailStubAudit() {
  // Reverse-bundle: list bundles containing this product (when isBundle=false)
  // useGetProducts does not accept containsProductId - recording gap
  return (
    <div className="space-y-4">
      <h2 className="font-heading text-xl">[STUB] Reverse-bundle nav</h2>
      <p className="text-destructive">
        Hook <code>useGetProducts</code> does not accept <code>containsProductId</code>. Backend
        endpoint filter missing. Recorded in audit.
      </p>
    </div>
  );
}
