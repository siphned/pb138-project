import { Link } from "@tanstack/react-router";
<<<<<<< HEAD
import { CatalogCard, catalogCardLinkClass } from "./CatalogCard";
import { CatalogPlaceholder } from "./CatalogPlaceholder";
=======
import { CatalogCard } from "./CatalogCard";
>>>>>>> origin/main

interface BundleCardProps {
  product: {
    id: string;
    name: string;
    price: string;
    wines?: unknown[];
    productWines?: unknown[];
  };
}

export function BundleCard({ product }: BundleCardProps) {
  const wineCount = (product.wines ?? product.productWines ?? []).length;
  const price = Number(product.price).toLocaleString("cs-CZ", {
    currency: "EUR",
    style: "currency",
  });

  return (
    <CatalogCard
<<<<<<< HEAD
      imageSlot={<CatalogPlaceholder text="BUNDLE" textClassName="text-2xl tracking-widest" />}
      titleLink={
        <Link
          className={catalogCardLinkClass}
          params={{ productId: product.id }}
          to="/products/$productId"
        >
          {product.name}
        </Link>
      }
    >
      {wineCount > 0 && (
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{wineCount} wines</p>
      )}
      <div className="text-xl font-bold text-foreground">{price}</div>
    </CatalogCard>
=======
      imageSlot={
        <div className="flex h-full w-full items-center justify-center bg-linear-to-b from-secondary/10 to-secondary/30">
          <span className="font-heading text-2xl font-bold uppercase tracking-widest text-secondary-foreground/20">
            BUNDLE
          </span>
        </div>
      }
      price={price}
      renderLink={(children) => (
        <Link
          className="stretched-link font-heading font-bold"
          params={{ productId: product.id }}
          to="/products/$productId"
        >
          {children}
        </Link>
      )}
      subtitle={wineCount > 0 ? `${wineCount} wines` : undefined}
      title={product.name}
    />
>>>>>>> origin/main
  );
}
