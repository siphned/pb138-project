import { Link } from "@tanstack/react-router";
import type { GetShops200 } from "@/generated/types/GetShops";
import { CatalogCard, catalogCardLinkClass } from "@/routes/-components/CatalogCard";
import { ShopImage } from "@/routes/-components/ShopImage";

export type GetShops200Item = GetShops200[number];

interface ShopCardProps {
  shop: GetShops200Item;
}

export function ShopCard({ shop }: ShopCardProps) {
  const location = [shop.address?.city, shop.address?.country].filter(Boolean).join(", ");

  return (
    <CatalogCard
      imageSlot={
        <ShopImage
          alt={shop.name}
          fallbackText={shop.name}
          imageUrl={shop.imageUrl}
          shopId={shop.id}
        />
      }
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
