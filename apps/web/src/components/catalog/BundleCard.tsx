import { Link } from "@tanstack/react-router";
import { CatalogCard, catalogCardLinkClass } from "./CatalogCard";
import { ProductImage } from "./ProductImage";

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
      imageSlot={<ProductImage alt={product.name} fallbackText="BUNDLE" productId={product.id} />}
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
  );
}
