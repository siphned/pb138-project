import { Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
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

  return (
    <Card className="group relative" variant="catalog">
      <div className="aspect-square w-full overflow-hidden rounded-t-xl bg-muted">
        {imageUrl ? (
          <img
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            src={imageUrl}
          />
        ) : (
          <CatalogPlaceholder
            text={product.isBundle ? "BUNDLE" : "PRODUCT"}
            textClassName="text-2xl tracking-widest"
          />
        )}

        {product.isBundle && (
          <div className="absolute top-3 right-3 z-10">
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-primary-foreground shadow-sm">
              BUNDLE
            </span>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-1">
        <h3 className="font-heading text-lg font-bold leading-tight">
          <Link
            className="stretched-link transition-colors hover:text-primary focus:outline-none"
            params={{ productId: product.id }}
            to="/products/$productId"
          >
            {product.name}
          </Link>
        </h3>

        <p className="text-sm text-muted-foreground">{product.shop.name}</p>

        <div className="mt-2 text-xl font-bold text-foreground">{price}</div>
      </CardContent>
    </Card>
  );
}
