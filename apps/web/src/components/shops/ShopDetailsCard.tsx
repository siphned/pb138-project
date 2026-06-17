import { MapPinIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { GetShopsById200 } from "@/generated/types/GetShopsById";
import { ShopHoursDisplay } from "@/routes/-components/ShopHoursDisplay";

interface ShopDetailsCardProps {
  shop: GetShopsById200;
}

export function ShopDetailsCard({ shop }: ShopDetailsCardProps) {
  return (
    <div className="space-y-8" data-slot="shop-details-sidebar">
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-heading">About Our Shop</h2>
        <div className="prose prose-sm dark:prose-invert">
          <p className="text-muted-foreground leading-relaxed">
            {shop.description ? shop.description : "No description available."}
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        <div className="space-y-4 rounded-md border border-border p-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Location
          </h3>
          <div className="flex items-start gap-3 text-sm">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <HugeiconsIcon className="h-4 w-4" icon={MapPinIcon} />
            </div>
            <div className="font-medium text-muted-foreground">
              {shop.address.street} {shop.address.houseNumber}
              <br />
              {shop.address.postalCode} {shop.address.city}
              <br />
              {shop.address.country}
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-md border border-border p-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Opening Hours
          </h3>
          <ShopHoursDisplay shopId={shop.id} />
        </div>
      </div>
    </div>
  );
}
