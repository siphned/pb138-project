import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { GetWines200 } from "@/generated/types/GetWines";
import { formatEur } from "@/lib/utils";
import { CatalogCard, catalogCardLinkClass } from "@/routes/-components/CatalogCard";
import { WineImage } from "@/routes/-components/WineImage";

export type GetWines200Item = GetWines200[number];

interface WineCardProps {
  wine: GetWines200Item;
  minPrice?: number;
  /** Optional pill rendered in the footer (e.g. bottle count inside a bundle). */
  badge?: ReactNode;
}

export function WineCard({ wine, minPrice, badge }: WineCardProps) {
  const subtitle = [wine.color, wine.region, wine.vintageYear].filter(Boolean).join(" · ");

  return (
    <CatalogCard
      imageSlot={
        <WineImage
          alt={wine.name}
          fallbackText={wine.name}
          imageUrl={wine.imageUrl}
          wineId={wine.id}
        />
      }
      titleLink={
        <Link className={catalogCardLinkClass} params={{ id: wine.id }} to="/wines/$id">
          {wine.name}
        </Link>
      }
    >
      <p className="text-xs text-muted-foreground">{subtitle}</p>
      {minPrice !== undefined && (
        <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
          from {formatEur(minPrice)}
        </span>
      )}
      {badge !== undefined && (
        <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
          {badge}
        </span>
      )}
    </CatalogCard>
  );
}
