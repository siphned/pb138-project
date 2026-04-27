import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { useState } from "react";
import { CatalogCard } from "@/components/catalog/CatalogCard";
import { Button } from "@/components/ui/button";
import type { GetProducts200 } from "@/generated/types/GetProducts";
import { cn } from "@/lib/utils";

interface WineCardProps {
  product: GetProducts200[number] & { shopName?: string };
  shopName?: string;
}

export function WineCard({ product, shopName }: WineCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const wine = product.wines[0];
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
        <div className="flex h-full w-full  items-center justify-center bg-gradient-to-b from-secondary/10 to-secondary/30">
          <span className="rotate-[-90deg] text-4xl font-bold uppercase tracking-widest text-secondary-foreground/20">
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
        <button
          className="rounded-full bg-background/80 p-2 transition-colors hover:bg-background"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setWishlisted((w) => !w);
          }}
          type="button"
        >
          <Heart
            className={cn(
              "h-5 w-5",
              wishlisted ? "fill-primary text-primary" : "text-muted-foreground"
            )}
          />
        </button>
      }
    />
  );
}
