import { Link } from "@tanstack/react-router";
import type { GetShops200 } from "@/generated/types/GetShops";
import { CatalogCard } from "./CatalogCard";
import { CatalogPlaceholder } from "./CatalogPlaceholder";

interface ShopCardProps {
  shop: GetShops200[number];
}

export function ShopCard({ shop }: ShopCardProps) {
  const initials = shop.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);

  return (
    <CatalogCard
      imageSlot={<CatalogPlaceholder text={initials} textClassName="text-4xl" />}
      renderLink={(children) => (
        <Link
          className="stretched-link font-heading font-bold text-lg"
          params={{ id: shop.id }}
          to="/shops/$id"
        >
          {children}
        </Link>
      )}
      subtitle={`${shop.address.city}, ${shop.address.country}`}
      title={shop.name}
    />
  );
}
