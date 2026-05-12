import { Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card className="group relative" variant="catalog">
      <div className="aspect-square w-full overflow-hidden rounded-t-xl bg-muted">
        {imageUrl ? (
          <img
            alt={wine.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            src={imageUrl}
          />
        ) : (
          <CatalogPlaceholder
            text={wine.color.toUpperCase()}
            textClassName="text-2xl tracking-widest"
          />
        )}
      </div>

      <CardContent className="p-4 space-y-1">
        <h3 className="font-heading text-lg font-bold leading-tight">
          <Link
            className="stretched-link transition-colors hover:text-primary focus:outline-none"
            params={{ id: wine.id }}
            to="/wines/$id"
          >
            {wine.name}
          </Link>
        </h3>

        <p className="text-sm text-muted-foreground">
          {[wine.color, wine.region, wine.vintageYear].filter(Boolean).join(" · ")}
        </p>

        {minPrice !== undefined && (
          <span className="mt-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
            from €{minPrice}
          </span>
        )}
      </CardContent>
    </Card>
  );
}
