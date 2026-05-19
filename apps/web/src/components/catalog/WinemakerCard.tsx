import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import type { GetWinemakers200 } from "@/generated/types/GetWinemakers";
import { WinemakerImage } from "./WinemakerImage";

export type GetWinemakers200Item = GetWinemakers200[number];

interface WinemakerCardProps {
  winemaker: GetWinemakers200Item;
}

export function WinemakerCard({ winemaker }: WinemakerCardProps) {
  return (
    <Card className="group relative" variant="polaroid">
      <div className="aspect-3/4 w-full overflow-hidden rounded-lg bg-muted shadow-xs">
        <WinemakerImage alt={winemaker.name} fallbackText={winemaker.name} winemakerId={winemaker.id} />
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
