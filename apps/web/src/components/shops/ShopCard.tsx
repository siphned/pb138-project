import { Link } from "@tanstack/react-router";
import { CatalogCard, catalogCardLinkClass } from "@/components/catalog/CatalogCard";
import { ShopImage } from "@/components/catalog/ShopImage";
import type { GetShops200 } from "@/generated/types/GetShops";

export type GetShops200Item = GetShops200["data"][number];

interface ShopCardProps {
  shop: GetShops200Item;
}

export function ShopCard({ shop }: ShopCardProps) {
  const location = [shop.address?.city, shop.address?.country].filter(Boolean).join(", ");

  return (
    <CatalogCard
      imageSlot={<ShopImage alt={shop.name} fallbackText={shop.name} shopId={shop.id} />}
      titleLink={
        <Link className={catalogCardLinkClass} params={{ id: shop.id }} to="/shops/$id">
          {shop.name}
        </Link>
      }
    >
      {location && <p className="text-xs text-muted-foreground">{location}</p>}
    </CatalogCard>
  );
}
