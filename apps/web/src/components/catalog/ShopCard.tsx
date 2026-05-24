import { Link } from "@tanstack/react-router";
import type { GetShops200 } from "@/generated/types/GetShops";
import { CatalogCard } from "./CatalogCard";

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
      imageSlot={
        <div className="flex h-full w-full items-center justify-center bg-linear-to-b from-secondary/10 to-secondary/30">
          <span className="font-heading text-4xl font-bold uppercase text-secondary-foreground/20">
            {initials}
          </span>
        </div>
      }
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
