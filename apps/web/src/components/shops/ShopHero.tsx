import { ShopManageMenu } from "./ShopManageMenu";
import type { GetShopsById200 } from "@/generated/types/GetShopsById";

interface ShopHeroProps {
  shop: GetShopsById200;
}

export function ShopHero({ shop }: ShopHeroProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between" data-slot="shop-hero">
      <div className="space-y-1">
        <h1 className="font-heading text-4xl font-bold tracking-tight lg:text-5xl text-foreground">
          {shop.name}
        </h1>
        <p className="text-lg text-muted-foreground font-medium">
          {[shop.address.city, shop.address.country].filter(Boolean).join(", ")}
        </p>
      </div>

      <ShopManageMenu shop={shop} />
    </div>
  );
}
