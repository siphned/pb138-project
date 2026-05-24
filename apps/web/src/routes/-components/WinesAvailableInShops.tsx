import { Image01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { ErrorState } from "@/components/primitives/error-state";
import { Section } from "@/components/primitives/section";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetProducts } from "@/generated/hooks/useGetProducts";
import { ProductPriceRow } from "./ProductPriceRow";
import { ProductSoldAtCard } from "./ProductSoldAtCard";

interface WinesAvailableInShopsProps {
  wineId: string;
}

function parseQuantity(raw: unknown): number {
  const n = Number.parseInt(String(raw ?? "0"), 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function ProductThumbnailPlaceholder() {
  return (
    <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg bg-muted">
      <HugeiconsIcon
        aria-label="No image"
        className="h-10 w-10 text-muted-foreground/40"
        icon={Image01Icon}
      />
    </div>
  );
}

export function WinesAvailableInShops({ wineId }: WinesAvailableInShopsProps) {
  const { data: productsData, isLoading, isError, refetch } = useGetProducts({ wineId });

  if (isLoading) {
    return (
      <Section heading="Available in shops">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </Section>
    );
  }

  if (isError) {
    return (
      <Section heading="Available in shops">
        <ErrorState
          message="Couldn't load shops selling this wine."
          onRetry={() => refetch()}
          title="Failed to load"
        />
      </Section>
    );
  }

  const products = productsData?.data ?? [];

  if (products.length === 0) {
    return (
      <Section heading="Available in shops">
        <p className="italic text-muted-foreground">
          This wine is not currently available in any shops.
        </p>
      </Section>
    );
  }

  return (
    <Section heading="Available in shops">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {products.map((product) => (
          <Card key={product.id} variant="default">
            <CardContent className="space-y-4">
              <Link
                className="block transition-opacity hover:opacity-80"
                params={{ productId: product.id }}
                to="/products/$productId"
              >
                <ProductThumbnailPlaceholder />
              </Link>
              <div>
                <Link
                  className="font-heading text-lg font-bold text-foreground transition-colors hover:text-primary"
                  params={{ productId: product.id }}
                  to="/products/$productId"
                >
                  {product.name}
                </Link>
                <div className="mt-2">
                  <ProductSoldAtCard shopId={product.shop.id} shopName={product.shop.name} />
                </div>
              </div>
              <ProductPriceRow
                price={product.price}
                productId={product.id}
                quantity={parseQuantity(product.quantity)}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
