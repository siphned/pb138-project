import { Section } from "@/components/primitives/section";
import type { GetShopsById200 } from "@/generated/types/GetShopsById";
import { ShopHeroGallery } from "@/routes/-components/ShopHeroGallery";

interface ShopHeroProps {
  shop: GetShopsById200;
}

export function ShopHero({ shop }: ShopHeroProps) {
  const location = [shop.address.city, shop.address.country].filter(Boolean).join(", ");

  return (
    <div className="flex flex-col gap-6 md:flex-row md:gap-8" data-slot="shop-hero">
      <div className="overflow-hidden rounded-3xl bg-muted shadow-lg md:w-1/2">
        <ShopHeroGallery shopName={shop.name} />
      </div>

      <div className="flex flex-col gap-4 md:w-1/2">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
            {shop.name}
          </h1>
          {location && <p className="text-lg text-muted-foreground">{location}</p>}
        </div>

        {shop.description && (
          <Section heading="About">
            <p className="text-sm leading-relaxed text-muted-foreground">{shop.description}</p>
          </Section>
        )}
      </div>
    </div>
  );
}
