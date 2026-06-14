import type { GetShopsById200 } from "@/generated/types/GetShopsById";
import { ShopManageMenu } from "@/routes/shops/$id/-components/ShopManageMenu";

interface ShopHeroProps {
  shop: GetShopsById200;
}

export function ShopHero({ shop }: ShopHeroProps) {
  return (
    <div className="space-y-6" data-slot="shop-hero">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <h1 className="font-heading text-5xl font-bold tracking-tight text-foreground lg:text-6xl">
            {shop.name}
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <p className="text-lg text-muted-foreground font-medium">
              {[shop.address.city, shop.address.country].filter(Boolean).join(", ")}
            </p>
          </div>
        </div>

        <ShopManageMenu shop={shop} />
      </div>
    </div>
  );
}
