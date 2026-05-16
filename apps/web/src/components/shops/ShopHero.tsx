import { ShopHeroGallery } from "@/routes/-components/ShopHeroGallery";
import type { GetShopsById200 } from "@/generated/types/GetShopsById";

interface ShopHeroProps {
  shop: GetShopsById200;
}

export function ShopHero({ shop }: ShopHeroProps) {
  return (
    <div className="space-y-6" data-slot="shop-hero">
      <div className="overflow-hidden rounded-3xl bg-muted shadow-lg">
        <ShopHeroGallery shopName={shop.name} />
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
            {shop.name}
          </h1>
          <p className="text-lg text-muted-foreground">
            {[shop.address.city, shop.address.country].filter(Boolean).join(", ")}
          </p>
        </div>

        {/* <ShopManageMenu> will be added here in Task 6 */}
      </div>
    </div>
  );
}
