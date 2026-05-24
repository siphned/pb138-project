<<<<<<< HEAD
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
    <Card className="group relative" data-slot="catalog-card" variant="polaroid">
      <div className="relative aspect-3/4 w-full overflow-hidden rounded-lg bg-muted shadow-xs">
        {imageSlot}
        {imageOverlay}
      </div>

      <div className="pt-4 text-center space-y-2">
        <h3 className="font-heading text-base font-bold leading-tight line-clamp-2">{titleLink}</h3>
        {children}
      </div>
=======
import type React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { StarRating } from "./StarRating";

interface CatalogCardProps {
  imageSlot: React.ReactNode;
  // Full content of the image area. Parent controls what goes here:
  // real <img>, a gradient placeholder, an avatar, etc.

  topRightSlot?: React.ReactNode;
  // Rendered as an absolute overlay in the top-right of the image.
  // Used for a heart/wishlist button or a badge.

  rating?: number;
  // 0–5 number. Renders 5 star icons, filled up to Math.floor(rating).
  // If undefined, the entire stars row is not rendered.

  reviewCount?: number;
  // Shown as "(N reviews)" next to the rating. Only shown if rating is defined.

  title: string;
  // Main card heading. Rendered in font-heading (Playfair Display).

  subtitle?: string;
  // Secondary info line below the title. Muted, uppercase, small.
  // Example: "Moravia • Vinný sklep Lechovice"

  price?: string;
  // Pre-formatted price string. Example: "€ 490,00"
  // If undefined, the price area is not rendered.

  actionSlot?: React.ReactNode;
  // CTA area bottom-right. Example: a "View Detail" Button.
  // Wrapped in z-index: 2 so it's clickable above the stretched link overlay.

  renderLink?: (children: React.ReactNode) => React.ReactNode;
  // If provided, called with the title text as children.
  // Must return a <Link> (or <a>) element with className="stretched-link ..."
  // This link's ::after pseudo-element covers the whole card.
  // If not provided, title renders as plain text.

  className?: string;
}

export function CatalogCard({
  imageSlot,
  topRightSlot,
  rating,
  reviewCount,
  title,
  subtitle,
  price,
  actionSlot,
  renderLink,
  className,
}: CatalogCardProps) {
  return (
    <Card
      className={cn(
        "group relative overflow-hidden p-0 rounded-2xl border-none bg-secondary/20 shadow-sm transition-all hover:shadow-md",
        className
      )}
    >
      <CardHeader className="p-2">
        <div className="relative rounded-md aspect-square w-full overflow-hidden bg-muted">
          {imageSlot}

          {topRightSlot && <div className="absolute top-3 right-3 z-10">{topRightSlot}</div>}
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-2">
        {rating !== undefined && <StarRating rating={rating} reviewCount={reviewCount} />}

        <div className="space-y-1">
          <h3 className="font-heading text-lg font-bold leading-tight">
            {renderLink ? renderLink(title) : title}
          </h3>

          {subtitle && (
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{subtitle}</p>
          )}
        </div>
      </CardContent>

      {(price !== undefined || actionSlot) && (
        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          {price !== undefined && (
            <span className="text-xl font-bold text-foreground">{price}</span>
          )}
          {actionSlot && <div className="relative z-2">{actionSlot}</div>}
        </CardFooter>
      )}
>>>>>>> origin/main
    </Card>
  );
}
