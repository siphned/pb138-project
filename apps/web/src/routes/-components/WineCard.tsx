import { Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import type { GetProducts200 } from "@/generated/types/GetProducts";
import { cn } from "@/lib/utils";

interface WineCardProps {
  product: GetProducts200[number];
}

export function WineCard({ product }: WineCardProps) {
  const wine = product.wines[0];
  const rating = Number(product.rating) || 0;
  const reviewCount = Number(product.reviewCount) || 0;

  return (
    <Card className="group overflow-hidden rounded-2xl border-none bg-secondary/20 shadow-sm transition-all hover:shadow-md">
      <CardHeader className="relative p-0">
        <div className="aspect-[4/5] w-full bg-muted flex items-center justify-center overflow-hidden">
          {/* Heart Icon */}
          <button
            className="absolute top-4 right-4 z-10 rounded-full bg-white/80 p-2 text-muted-foreground hover:text-primary transition-colors"
            type="button"
          >
            <Heart className="h-5 w-5" />
          </button>

          {/* Placeholder for Wine Image */}
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-secondary/10 to-secondary/30">
            <span className="text-secondary-foreground/20 font-bold text-4xl uppercase tracking-widest rotate-[-90deg]">
              {wine?.type || "Wine"}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-2">
        {/* Rating */}
        <div className="flex items-center gap-1 text-sm">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                className={cn(
                  "h-3.5 w-3.5",
                  star <= Math.floor(rating) ? "fill-star text-star" : "text-muted border-muted"
                )}
                key={`star-${star}`}
              />
            ))}
          </div>
          <span className="font-medium ml-1">{rating.toFixed(1)}</span>
          <span className="text-muted-foreground">({reviewCount} reviews)</span>
        </div>

        {/* Title & Winemaker */}
        <div className="space-y-1">
          <h3 className="font-heading text-lg font-bold leading-tight group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            {wine?.region} • {wine?.winemaker?.name}
          </p>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="text-xl font-bold text-foreground">
          {Number(product.price).toLocaleString("cs-CZ", { currency: "EUR", style: "currency" })}
        </div>
        <Button
          className="rounded-full px-4 hover:bg-primary hover:text-primary-foreground"
          size="sm"
          variant="outline"
        >
          View Detail
        </Button>
      </CardFooter>
    </Card>
  );
}
