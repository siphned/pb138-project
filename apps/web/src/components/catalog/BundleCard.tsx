import { Link } from "@tanstack/react-router";
import { CatalogCard } from "./CatalogCard";

interface BundleCardProps {
  product: {
    id: string;
    name: string;
    price: string;
    wineCount?: number;
  };
}

export function BundleCard({ product }: BundleCardProps) {
  return (
    <div className="w-[200px] flex-shrink-0">
      <CatalogCard
        imageSlot={
          <div className="flex h-full w-full items-center justify-center bg-linear-to-b from-secondary/10 to-secondary/30">
            <span className="font-heading text-2xl font-bold uppercase tracking-widest text-secondary-foreground/20">
              BUNDLE
            </span>
          </div>
        }
        price={product.price}
        renderLink={(children) => (
          <Link
            className="stretched-link font-heading font-bold"
            params={{ productId: product.id }}
            to="/products/$productId"
          >
            {children}
          </Link>
        )}
        subtitle={product.wineCount ? `${product.wineCount} wines` : undefined}
        title={product.name}
      />
    </div>
  );
}
