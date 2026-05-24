import { ShoppingCart01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { DataGrid } from "@/components/primitives/data-grid";
import { DescriptionList, PropertyRow } from "@/components/primitives/description-list";
import { Section } from "@/components/primitives/section";
import { ShowOwner } from "@/components/primitives/show-owner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useGetProductsByIdImages } from "@/generated/hooks/useGetProductsByIdImages";
import type { GetProductsById200 } from "@/generated/types/GetProductsById";
import { CatalogPlaceholder } from "./CatalogPlaceholder";
import { WineCard } from "./WineCard";

interface ProductDetailsCardProps {
  product: GetProductsById200;
  onAddToCart: () => void;
  isAddingToCart: boolean;
}

function ProductImageCarousel({
  productId,
  name,
  fallbackColor,
}: {
  productId: string;
  name: string;
  fallbackColor?: string;
}) {
  const { data: images } = useGetProductsByIdImages(productId);
  const photos = images ?? [];

  if (photos.length === 0) {
    return (
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted shadow-xs">
        <CatalogPlaceholder color={fallbackColor} text={name} />
      </div>
    );
  }

  if (photos.length === 1) {
    return (
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted shadow-xs">
        <img alt={name} className="h-full w-full object-cover" src={photos[0].url} />
      </div>
    );
  }

  return (
    <Carousel className="w-full" opts={{ loop: true }}>
      <CarouselContent>
        {photos.map((img, i) => (
          <CarouselItem key={img.id}>
            <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted shadow-xs">
              <img
                alt={`${name} — ${i + 1}`}
                className="h-full w-full object-cover"
                src={img.url}
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2" />
      <CarouselNext className="right-2" />
    </Carousel>
  );
}

export function ProductDetailsCard({
  product,
  onAddToCart,
  isAddingToCart,
}: ProductDetailsCardProps) {
  const price = Number(product.price).toLocaleString("en-IE", {
    currency: "EUR",
    style: "currency",
  });

  // biome-ignore lint/suspicious/noExplicitAny: GetProductsById200 is `any` in OpenAPI (BE follow-up)
  const firstWineColor = (product.productWines as any)?.[0]?.wine?.color;

  return (
    <div className="space-y-8">
      <Section heading="About this product">
        <Card variant="default">
          <CardContent className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_2fr]">
            <ProductImageCarousel
              fallbackColor={firstWineColor}
              name={product.name}
              productId={product.id}
            />
            <div className="space-y-6">
              <DescriptionList>
                <PropertyRow label="Price" value={price} />
                <PropertyRow
                  label="Availability"
                  value={product.quantity > 0 ? `${product.quantity} in stock` : "Out of stock"}
                />
                <PropertyRow
                  label="Type"
                  value={product.isBundle ? "Bundle" : "Single Product"}
                />
              </DescriptionList>

              {product.description && (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
              )}

              <Button
                className="w-full sm:w-auto"
                disabled={isAddingToCart || product.quantity === 0}
                onClick={onAddToCart}
              >
                <HugeiconsIcon className="mr-2 h-4 w-4" icon={ShoppingCart01Icon} />
                {isAddingToCart ? "Adding..." : "Add to cart"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </Section>

      {product.productWines && product.productWines.length > 0 && (
        <Section heading="Wines in this product">
          <DataGrid variant="catalog">
            {
              // biome-ignore lint/suspicious/noExplicitAny: GetProductsById200 is `any` in OpenAPI; pw shape lost
              product.productWines.map((pw: any) => {
                const wineWithFallbacks = {
                  color: "unknown",
                  region: "",
                  vintageYear: "",
                  ...pw.wine,
                  // biome-ignore lint/suspicious/noExplicitAny: productWines.wine in OpenAPI is narrower than GetWines200Item (BE follow-up)
                } as any;
                return <WineCard key={pw.wine.id} wine={wineWithFallbacks} />;
              })
            }
          </DataGrid>
        </Section>
      )}

      <ShowOwner ownerUserId={product.shop?.ownerUserId}>
        <div className="flex flex-wrap gap-4">
          <Button
            render={<Link params={{ productId: product.id }} to="/products/$productId/edit" />}
            variant="outline"
          >
            Edit Product
          </Button>
        </div>
      </ShowOwner>
    </div>
  );
}
