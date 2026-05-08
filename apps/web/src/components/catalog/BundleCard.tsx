import { Link } from "@tanstack/react-router";
import { CatalogCard } from "./CatalogCard";
import { CatalogPlaceholder } from "./CatalogPlaceholder";

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
      imageSlot={<CatalogPlaceholder text="BUNDLE" textClassName="text-2xl tracking-widest" />}
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
