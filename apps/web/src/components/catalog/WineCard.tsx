import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import type { GetWines200 } from "@/generated/types/GetWines";
import { WineImage } from "./WineImage";

export type GetWines200Item = GetWines200[number];

interface WineCardProps {
  wine: GetWines200Item;
  minPrice?: number;
}

export function WineCard({ wine, minPrice }: WineCardProps) {
  return (
    <Card className="group relative" variant="polaroid">
      <div className="aspect-3/4 w-full overflow-hidden rounded-lg bg-muted shadow-xs">
        <WineImage alt={wine.name} fallbackColor={wine.color} fallbackText={wine.name} wineId={wine.id} />
      </div>

      <div className="pt-4 text-center">
        <h3 className="font-heading text-base font-bold leading-tight">
          <Link
            className="stretched-link transition-colors hover:text-primary focus:outline-none"
            params={{ id: wine.id }}
            to="/wines/$id"
          >
            {wine.name}
          </Link>
        </h3>

        <p className="text-xs text-muted-foreground mt-1">
          {[wine.color, wine.region, wine.vintageYear].filter(Boolean).join(" · ")}
        </p>

        {minPrice !== undefined && (
          <span className="mt-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            from €{minPrice}
          </span>
        )}
      </div>
    </Card>
  );
}
