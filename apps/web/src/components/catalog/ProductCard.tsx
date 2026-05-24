import { Link } from "@tanstack/react-router";
import type { GetProducts200 } from "@/generated/types/GetProducts";
import { CatalogCard, catalogCardLinkClass } from "./CatalogCard";
import { ProductImage } from "./ProductImage";

export type GetProducts200Item = GetProducts200["data"][number];

interface ProductCardProps {
  product: GetProducts200Item;
  showShopName?: boolean;
}

export function ProductCard({ product, showShopName = true }: ProductCardProps) {
  const price = Number(product.price).toLocaleString("en-IE", {
    currency: "EUR",
    style: "currency",
  });

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
        <ProductImage
          alt={product.name}
          fallbackText={product.name}
          productId={product.id}
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
