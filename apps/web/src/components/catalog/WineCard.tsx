import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import type { GetWines200 } from "@/generated/types/GetWines";
import { CatalogPlaceholder } from "./CatalogPlaceholder";

export type GetWines200Item = GetWines200[number] & {
  images?: { url: string }[];
};

interface WineCardProps {
  wine: GetWines200Item;
  minPrice?: number;
}

export function WineCard({ wine, minPrice }: WineCardProps) {
  const imageUrl = wine.images?.[0]?.url;

  return (
    <Card className="group relative" variant="polaroid">
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted shadow-xs">
        {imageUrl ? (
          <img
            alt={wine.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            src={imageUrl}
          />
        ) : (
          <CatalogPlaceholder color={wine.color} text={wine.name} />
        )}
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
