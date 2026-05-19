import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import type { GetShops200 } from "@/generated/types/GetShops";
import { ShopImage } from "./ShopImage";

export type GetShops200Item = GetShops200[number];

interface ShopCardProps {
  shop: GetShops200Item;
}

export function ShopCard({ shop }: ShopCardProps) {
  return (
    <Card className="group relative" variant="polaroid">
      <div className="aspect-3/4 w-full overflow-hidden rounded-lg bg-muted shadow-xs">
        <ShopImage alt={shop.name} fallbackText={shop.name} shopId={shop.id} />
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
