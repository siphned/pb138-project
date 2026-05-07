import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useState } from "react";
import { CatalogCard } from "@/components/catalog/CatalogCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WineCardProduct {
  id: string;
  name: string;
  price: string | number;
  rating?: string | number | null;
  reviewCount?: string | number | null;
  shopName?: string;
  wines?: {
    color?: string;
    id?: string;
    name?: string;
    region?: string;
    type?: string;
    vintageYear?: string | number;
    winemaker?: { id?: string; name?: string };
  }[];
  [key: string]: unknown;
}

interface WineCardProps {
  product: WineCardProduct;
  shopName?: string;
}

export function WineCard({ product, shopName }: WineCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const wine = product.wines?.[0];
  const rating = Number(product.rating) || 0;
  const reviewCount = Number(product.reviewCount) || 0;
  const price = Number(product.price).toLocaleString("cs-CZ", {
    currency: "EUR",
    style: "currency",
  });
  const subtitle = [wine?.region, wine?.winemaker?.name, shopName].filter(Boolean).join(" • ");

  return (
    <CatalogCard
      imageSlot={
        <div className="flex h-full w-full  items-center justify-center bg-linear-to-b from-secondary/10 to-secondary/30">
          <span className="-rotate-90 text-4xl font-bold uppercase tracking-widest text-secondary-foreground/20">
            {wine?.color ?? wine?.type ?? "Wine"}
          </span>
        </div>
      }
      price={price}
      rating={rating}
      renderLink={(children) => (
        <Link
          className="stretched-link font-heading font-bold text-lg leading-tight transition-colors hover:text-primary focus:outline-none"
          params={{ productId: product.id }}
          to="/products/$productId"
        >
          {children}
        </Link>
      )}
      reviewCount={reviewCount}
      subtitle={subtitle || undefined}
      title={product.name}
      topRightSlot={
        <Button
          className="rounded-full bg-background/80 p-2 opacity-50 cursor-not-allowed h-auto w-auto"
          disabled
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setWishlisted((w) => !w);
          }}
          title="Wishlist coming soon"
          variant="ghost"
        >
          <Heart
            className={cn(
              "h-5 w-5",
              wishlisted ? "fill-primary text-primary" : "text-muted-foreground"
            )}
          />
        </Button>
      }
    />
  );
}
