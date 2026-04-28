import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ReviewList } from "@/components/reviews/ReviewList";
import { ReviewsSummary } from "@/components/reviews/ReviewsSummary";
import { Button } from "@/components/ui/button";
import { useGetProductsById } from "@/generated/hooks/productsController/useGetProductsById";
import { useGetReviewsProductById } from "@/generated/reviews/reviews";
import { BundleContentsList } from "./-components/BundleContentsList";
import { BundlesContainingWine } from "./-components/BundlesContainingWine";
import { ProductHero } from "./-components/ProductHero";
import { ProductImagePlaceholder } from "./-components/ProductImagePlaceholder";
import { ProductInfo } from "./-components/ProductInfo";
import { ProductPriceRow } from "./-components/ProductPriceRow";
import { ProductWineAssociation } from "./-components/ProductWineAssociation";

// cast: remove once backend fixes OpenAPI spec for GET /products/:id
type ProductDetail = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  quantity: number;
  isBundle: boolean;
  shopId: string;
  rating: number;
  reviewCount: number;
  wines: {
    id: string;
    name: string;
    region: string;
    vintageYear: number;
    type: string;
    color: string;
    winemaker: { id: string; name: string };
  }[];
};

export const Route = createFileRoute("/products/$productId")({
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productId } = Route.useParams();
  const { data, isLoading, isError, refetch } = useGetProductsById(productId);
  const { data: reviewData, isLoading: reviewsLoading } = useGetReviewsProductById(productId);

  const product = data as ProductDetail | undefined;

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-6 py-8 lg:px-12 space-y-8">
          <div className="h-6 w-32 animate-pulse rounded-md bg-secondary/20" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="aspect-square w-full animate-pulse rounded-2xl bg-secondary/20" />
            <div className="space-y-6">
              <div className="h-10 w-3/4 animate-pulse rounded-md bg-secondary/20" />
              <div className="h-24 w-full animate-pulse rounded-2xl bg-secondary/20" />
              <div className="h-48 w-full animate-pulse rounded-2xl bg-secondary/20" />
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (isError || !product) {
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

        <ProductHero>
          {{
            image: (
              <ProductImagePlaceholder isBundle={product.isBundle} wine={product.wines?.[0]} />
            ),
            info: (
              <div className="space-y-8">
                <ProductInfo
                  isBundle={product.isBundle}
                  name={product.name}
                  rating={reviewData?.averageRating ?? undefined}
                  reviewCount={reviewData?.reviews?.length}
                  wines={product.wines ?? []}
                />
                <ProductPriceRow
                  price={product.price}
                  productId={product.id}
                  quantity={product.quantity}
                />
              </div>
            ),
          }}
        </ProductHero>

        {product.isBundle ? (
          <BundleContentsList wines={product.wines ?? []} />
        ) : (
          product.wines?.[0] && <ProductWineAssociation wine={product.wines[0]} />
        )}

        <BundlesContainingWine />

        <div className="space-y-6 pt-8 border-t">
          <h2 className="font-heading text-2xl font-bold">Customer Reviews</h2>

          {reviewData && reviewData.averageRating !== null && (
            <ReviewsSummary
              averageRating={reviewData.averageRating}
              reviewCount={reviewData.reviews.length}
            />
          )}

          <ReviewList
            emptyMessage="Be the first to review this product."
            isLoading={reviewsLoading}
            reviews={
              reviewData?.reviews.map((r) => ({
                authorName: `${r.user.fname} ${r.user.lname}`,
                body: r.body ?? "",
                createdAt: r.createdAt as unknown as string,
                id: r.id,
                rating: r.rating as unknown as number,
              })) ?? []
            }
          />
        </div>
      </div>
    </PublicLayout>
  );
}
