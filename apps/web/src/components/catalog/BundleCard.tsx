import { Link } from "@tanstack/react-router";
import { CatalogCard } from "./CatalogCard";

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
  );
}
