import {
  MinusSignIcon,
  PlusSignIcon,
  ShoppingCart01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { DataGrid } from "@/components/primitives/data-grid";
import { Section } from "@/components/primitives/section";
import { ShowOwner } from "@/components/primitives/show-owner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import { useGetProductsByIdImages } from "@/generated/hooks/useGetProductsByIdImages";
import type { GetProductsById200 } from "@/generated/types/GetProductsById";
import { CatalogPlaceholder } from "./CatalogPlaceholder";
import { WineCard } from "./WineCard";

interface ProductDetailsCardProps {
  product: GetProductsById200;
  onAddToCart: (quantity: number) => void;
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

function QuantityStepper({
  value,
  max,
  onChange,
  disabled,
}: {
  value: number;
  max: number;
  onChange: (next: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <Button
        className="h-9 w-9 rounded-full"
        disabled={disabled || value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
        size="icon"
        variant="outline"
      >
        <HugeiconsIcon className="h-4 w-4" icon={MinusSignIcon} />
        <span className="sr-only">Decrease quantity</span>
      </Button>
      <span className="min-w-10 text-center text-sm font-semibold tabular-nums">{value}</span>
      <Button
        className="h-9 w-9 rounded-full"
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        size="icon"
        variant="outline"
      >
        <HugeiconsIcon className="h-4 w-4" icon={PlusSignIcon} />
        <span className="sr-only">Increase quantity</span>
      </Button>
    </div>
  );
}

function stockBadge(quantity: number) {
  if (quantity === 0) return { label: "Out of stock", variant: "destructive" as const };
  if (quantity <= 5) return { label: `Only ${quantity} left`, variant: "warning" as const };
  return { label: "In stock", variant: "success" as const };
}

export function ProductDetailsCard({
  product,
  onAddToCart,
  isAddingToCart,
}: ProductDetailsCardProps) {
  const [quantity, setQuantity] = useState(1);

  const price = Number(product.price).toLocaleString("en-IE", {
    currency: "EUR",
    style: "currency",
  });

  // biome-ignore lint/suspicious/noExplicitAny: GetProductsById200 is `any` in OpenAPI (BE follow-up)
  const firstWineColor = (product.productWines as any)?.[0]?.wine?.color;
  const outOfStock = product.quantity === 0;
  const stock = stockBadge(product.quantity);
  const clampedQuantity = Math.min(quantity, Math.max(1, product.quantity));

  return (
    <div className="space-y-8">
      <Card variant="default">
        <CardContent className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_2fr]">
          <ProductImageCarousel
            fallbackColor={firstWineColor}
            name={product.name}
            productId={product.id}
          />
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              {product.isBundle && <Badge variant="secondary">Bundle</Badge>}
              <Badge variant={stock.variant}>{stock.label}</Badge>
            </div>

            <div className="space-y-1">
              <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
                {product.name}
              </h1>
              {product.shop && (
                <p className="text-sm text-muted-foreground">
                  Sold by{" "}
                  <Link
                    className="font-semibold text-primary underline-offset-2 transition-colors hover:underline"
                    params={{ id: product.shop.id }}
                    to="/shops/$id"
                  >
                    {product.shop.name}
                  </Link>
                </p>
              )}
            </div>

            <p className="font-heading text-3xl font-bold text-foreground">{price}</p>

            {product.description && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Description
                  </p>
                  <p className="text-sm leading-relaxed text-foreground">
                    {product.description}
                  </p>
                </div>
              </>
            )}

            <Separator />

            <div className="flex flex-wrap items-center gap-4">
              <QuantityStepper
                disabled={outOfStock || isAddingToCart}
                max={product.quantity}
                onChange={setQuantity}
                value={clampedQuantity}
              />
              <Button
                className="flex-1 sm:flex-none"
                disabled={isAddingToCart || outOfStock}
                onClick={() => onAddToCart(clampedQuantity)}
              >
                <HugeiconsIcon className="mr-2 h-4 w-4" icon={ShoppingCart01Icon} />
                {isAddingToCart ? "Adding..." : `Add ${clampedQuantity} to cart`}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {product.isBundle && product.productWines && product.productWines.length > 0 && (
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
