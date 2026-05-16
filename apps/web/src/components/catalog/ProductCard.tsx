import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import type { GetProducts200 } from "@/generated/types/GetProducts";
import { CatalogPlaceholder } from "./CatalogPlaceholder";

export type GetProducts200Item = GetProducts200["data"][number] & {
  images?: { url: string }[];
};

interface ProductCardProps {
  product: GetProducts200Item;
}

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.images?.[0]?.url;
  const price = Number(product.price).toLocaleString("en-IE", {
    currency: "EUR",
    style: "currency",
  });

  const firstWineColor = product.wines?.[0]?.color;

  return (
    <Card className="group relative" variant="polaroid">
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted shadow-xs">
        {imageUrl ? (
          <img
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            src={imageUrl}
          />
        ) : (
          <CatalogPlaceholder color={firstWineColor} text={product.name} />
        )}

        {product.isBundle && (
          <div className="absolute top-2 right-2 z-10">
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold tracking-wider text-primary-foreground shadow-sm">
              BUNDLE
            </span>
          </div>
        )}
      </div>

      <div className="pt-4 text-center">
        <h3 className="font-heading text-base font-bold leading-tight">
          <Link
            className="stretched-link transition-colors hover:text-primary focus:outline-none"
            params={{ productId: product.id }}
            to="/products/$productId"
          >
            {product.name}
          </Link>
        </h3>

        <p className="text-xs text-muted-foreground mt-1">{product.shop.name}</p>

        <div className="mt-2 text-lg font-bold text-foreground">{price}</div>
      </div>
    </Card>
  );
}
