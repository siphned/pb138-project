import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

/**
 * Shared className for the title Link inside `<CatalogCard>` — `stretched-link`
 * extends the link's hit target to the whole card via the polaroid positioning
 * context. Use this on the Link you pass into `titleLink`.
 */
export const catalogCardLinkClass =
  "stretched-link transition-colors hover:text-primary focus:outline-none";

interface CatalogCardProps {
  /** The image element (e.g. `<WineImage>` / `<ProductImage>`); placeholder fallback handled by the slot. */
  imageSlot: ReactNode;
  /** Optional element positioned over the image (e.g. a BUNDLE badge). */
  imageOverlay?: ReactNode;
  /** Wrap the entity name in a TanStack Router `<Link>` with `catalogCardLinkClass`. */
  titleLink: ReactNode;
  /** Body content rendered under the title (subtitle text, badges, CTA buttons). */
  children?: ReactNode;
}

/**
 * Polaroid catalog card scaffold shared across wine, product, winemaker, shop,
 * and event cards. Owns:
 *
 *  - `<Card variant="polaroid">` wrapper (positioning context for the stretched
 *    title link),
 *  - the `aspect-3/4` image slot (with relative positioning so overlays work),
 *  - the centered footer layout.
 */
export function CatalogCard({ imageSlot, imageOverlay, titleLink, children }: CatalogCardProps) {
  return (
    <Card className="group relative h-full" data-slot="catalog-card" variant="polaroid">
      <div className="relative aspect-3/4 w-full overflow-hidden rounded-lg bg-muted shadow-xs">
        {imageSlot}
        {imageOverlay}
      </div>

      <div className="p-4 text-center space-y-2">
        <h3 className="font-heading text-base font-bold leading-tight line-clamp-2">{titleLink}</h3>
        {children}
      </div>
    </Card>
  );
}
