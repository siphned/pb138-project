import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import type { GetWinemakers200 } from "@/generated/types/GetWinemakers";
import { resolveImageUrl } from "@/lib/utils";
import { CatalogPlaceholder } from "./CatalogPlaceholder";

export type GetWinemakers200Item = GetWinemakers200["data"][number] & {
  images?: { url: string }[];
};

interface WinemakerCardProps {
  winemaker: GetWinemakers200Item;
}

export function WinemakerCard({ winemaker }: WinemakerCardProps) {
  const imageUrl = winemaker.images?.[0]?.url;

  return (
    <Card className="group relative" variant="polaroid">
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted shadow-xs">
        {imageUrl ? (
          <img
            alt={winemaker.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            src={resolveImageUrl(imageUrl)}
          />
        ) : (
          <CatalogPlaceholder text={winemaker.name} />
        )}
      </div>

      <div className="pt-4 text-center">
        <h3 className="font-heading text-base font-bold leading-tight">
          <Link
            className="stretched-link transition-colors hover:text-primary focus:outline-none"
            params={{ id: winemaker.id }}
            to="/winemakers/$id"
          >
            {winemaker.name}
          </Link>
        </h3>

        <p className="text-xs text-muted-foreground mt-1">
          {[winemaker.address?.city, winemaker.address?.country].filter(Boolean).join(", ")}
        </p>
      </div>
    </Card>
  );
}
