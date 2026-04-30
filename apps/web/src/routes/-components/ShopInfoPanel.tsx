import { MapPin } from "lucide-react";
import { StarRating } from "@/components/catalog/StarRating";
import type { GetShopsById200 } from "@/generated/types/GetShopsById";

interface ShopInfoPanelProps {
  name: string;
  address: GetShopsById200["address"];
  rating?: number;
  reviewCount?: number;
}

export function ShopInfoPanel({ name, address, rating, reviewCount }: ShopInfoPanelProps) {
  const fullAddress = `${address.street} ${address.houseNumber}, ${address.city} ${address.postalCode}, ${address.country}`;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-bold lg:text-4xl">{name}</h1>
        {rating !== undefined && <StarRating rating={rating} reviewCount={reviewCount} size="md" />}
      </div>

      <div className="flex place-items-baseline gap-2 text-muted-foreground">
        <MapPin className="mt-1 h-4 w-4 shrink-0" />
        <p className="text-sm lg:text-base">{fullAddress}</p>
      </div>
    </div>
  );
}
