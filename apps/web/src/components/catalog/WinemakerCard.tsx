import { Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import type { GetWinemakers200 } from "@/generated/types/GetWinemakers";
import { CatalogPlaceholder } from "./CatalogPlaceholder";

export type GetWinemakers200Item = GetWinemakers200[number] & {
  images?: { url: string }[];
};

interface WinemakerCardProps {
  winemaker: GetWinemakers200Item;
}

export function WinemakerCard({ winemaker }: WinemakerCardProps) {
  const imageUrl = winemaker.images?.[0]?.url;
  const initials = winemaker.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Card className="group relative" variant="catalog">
      <div className="aspect-square w-full overflow-hidden rounded-t-xl bg-muted">
        {imageUrl ? (
          <img
            alt={winemaker.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            src={imageUrl}
          />
        ) : (
          <CatalogPlaceholder text={initials} textClassName="text-4xl" />
        )}
      </div>

      <CardContent className="p-4 space-y-1">
        <h3 className="font-heading text-lg font-bold leading-tight">
          <Link
            className="stretched-link transition-colors hover:text-primary focus:outline-none"
            params={{ id: winemaker.id }}
            to="/winemakers/$id"
          >
            {winemaker.name}
          </Link>
        </h3>

        <p className="text-sm text-muted-foreground">
          {[winemaker.address?.city, winemaker.address?.country].filter(Boolean).join(", ")}
        </p>
      </CardContent>
    </Card>
  );
}
