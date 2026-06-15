import { Link } from "@tanstack/react-router";
import type { GetProducts200 } from "@/generated/types/GetProducts";
import { formatEur } from "@/lib/utils";
import { CatalogCard, catalogCardLinkClass } from "@/routes/-components/CatalogCard";
import { EntityImage } from "@/routes/-components/EntityImage";

export type GetProducts200Item = GetProducts200["data"][number];

interface ProductCardProps {
  product: GetProducts200Item;
  showShopName?: boolean;
}

export function ProductCard({ product, showShopName = true }: ProductCardProps) {
  const price = formatEur(product.price);

  return (
    <CatalogCard
      imageOverlay={
        product.isBundle && (
          <div className="absolute top-2 right-2 z-10">
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold tracking-wider text-primary-foreground shadow-sm">
              BUNDLE
            </span>
          </div>
        )
      }
      imageSlot={
        <EntityImage
          alt={product.name}
          entityType="product"
          fallbackText={product.name}
          imageUrl={product.imageUrl}
        />
      }
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
      {showShopName && product.shop && (
        <p className="text-xs text-muted-foreground">{product.shop.name}</p>
      )}
      <div className="text-lg font-bold text-foreground">{price}</div>
    </CatalogCard>
  );
}
