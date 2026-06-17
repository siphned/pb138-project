import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import type { GetShops200 } from "@/generated/types/GetShops";
import { resolveImageUrl } from "@/lib/utils";
import { CatalogPlaceholder } from "./CatalogPlaceholder";

export type GetShops200Item = GetShops200["data"][number] & {
  images?: { url: string }[];
};

interface ShopCardProps {
  shop: GetShops200Item;
}

export function ShopCard({ shop }: ShopCardProps) {
  const imageUrl = shop.images?.[0]?.url;

  return (
    <Card className="group relative" variant="polaroid">
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted shadow-xs">
        {imageUrl ? (
          <img
            alt={shop.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            src={resolveImageUrl(imageUrl)}
          />
        ) : (
          <CatalogPlaceholder text={shop.name} />
        )}
      </div>

      <div className="pt-4 text-center">
        <h3 className="font-heading text-base font-bold leading-tight">
          <Link
            className="stretched-link transition-colors hover:text-primary focus:outline-none"
            params={{ id: shop.id }}
            to="/shops/$id"
          >
            {shop.name}
          </Link>
        </h3>

        <p className="text-xs text-muted-foreground mt-1">
          {[shop.address?.city, shop.address?.country].filter(Boolean).join(", ")}
        </p>
      </div>
    </Card>
  );
}
