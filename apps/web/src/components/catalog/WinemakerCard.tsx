import { Link } from "@tanstack/react-router";
import type { GetWinemakers200 } from "@/generated/types/GetWinemakers";
import { CatalogCard, catalogCardLinkClass } from "./CatalogCard";
import { WinemakerImage } from "./WinemakerImage";

export type GetWinemakers200Item = GetWinemakers200[number];

interface WinemakerCardProps {
  winemaker: GetWinemakers200Item;
}

export function WinemakerCard({ winemaker }: WinemakerCardProps) {
  const location = [winemaker.address?.city, winemaker.address?.country].filter(Boolean).join(", ");

  return (
    <CatalogCard
      imageSlot={
        <WinemakerImage
          alt={winemaker.name}
          fallbackText={winemaker.name}
          imageUrl={winemaker.imageUrl}
          winemakerId={winemaker.id}
        />
      }
      titleLink={
        <Link className={catalogCardLinkClass} params={{ id: winemaker.id }} to="/winemakers/$id">
          {winemaker.name}
        </Link>
      }
    >
      {location && <p className="text-xs text-muted-foreground">{location}</p>}
    </CatalogCard>
  );
}
