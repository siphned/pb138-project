import { Star } from "lucide-react";
import type React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
        {rating !== undefined && (
          <div className="flex items-center gap-1.5 text-sm">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  className={cn(
                    "h-3.5 w-3.5",
                    star <= Math.floor(rating) ? "fill-star text-star" : "text-muted-foreground"
                  )}
                  key={star}
                />
              ))}
            </div>
            <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
            {reviewCount !== undefined && (
              <span className="text-muted-foreground">({reviewCount} reviews)</span>
            )}
          </div>
        )}

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
    </Card>
  );
}
