import { Link } from "@tanstack/react-router";
import type { GetWinemakers200 } from "@/generated/types/GetWinemakers";
import { CatalogCard, catalogCardLinkClass } from "@/components/catalog/CatalogCard";
import { WinemakerImage } from "@/components/catalog/WinemakerImage";

type WinemakerItem = GetWinemakers200[number];

interface WinemakerCardProps {
  winemaker: WinemakerItem;
}

export function WinemakerCard({ winemaker }: WinemakerCardProps) {
  const location = winemaker.address
    ? [winemaker.address.city, winemaker.address.country].filter(Boolean).join(", ")
    : undefined;

  return (
    <CatalogCard
      imageSlot={
        <WinemakerImage
          alt={winemaker.name}
          fallbackText={winemaker.name}
          winemakerId={winemaker.id}
        />
      }
      titleLink={
        <Link className={catalogCardLinkClass} params={{ id: winemaker.id }} to="/winemakers/$id">
          {winemaker.name}
        </Link>
      }
    >
      {location && <p className="text-xs text-muted-foreground line-clamp-1">{location}</p>}
      {winemaker.description && (
        <p className="line-clamp-2 text-xs text-muted-foreground">{winemaker.description}</p>
      )}
    </CatalogCard>
  );
}
