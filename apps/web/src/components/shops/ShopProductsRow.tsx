import { Link } from "@tanstack/react-router";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { Section } from "@/components/primitives/section";
import { Button } from "@/components/ui/button";
import { useGetShopsByIdProducts } from "@/generated/hooks/useGetShopsByIdProducts";

interface ShopProductsRowProps {
  shopId: string;
  isBundle?: boolean;
}

export function ShopProductsRow({ shopId, isBundle }: ShopProductsRowProps) {
  const { data, isLoading, isError, refetch } = useGetShopsByIdProducts(
    shopId,
    isBundle !== undefined ? { isBundle: String(isBundle) } : undefined
  );

  if (isLoading) {
    return <LoadingState variant="catalog" />;
  }

  if (isError) {
    return (
      <ErrorState
        message="Failed to load items for this shop."
        onRetry={() => refetch()}
        title="Error loading items"
      />
    );
  }

  const items = (data || []).slice(0, 10);

  if (items.length === 0) {
    return null; // Don't render the section if empty
  }

  const title = isBundle ? "Wine Bundles" : "Products";

  return (
    <Section
      actions={
        <Button
          className="text-xs font-semibold"
          render={
            <Link
              params={{}}
              search={{ isBundle: !!isBundle, shopId }}
              to="/products"
            />
          }
          size="sm"
          variant="ghost"
        >
          View all
          <HugeiconsIcon className="ml-1 h-3 w-3" icon={ArrowRight01Icon} />
        </Button>
      }
      heading={title}
    >
      <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((product) => (
          <div className="w-[280px] shrink-0 snap-start" key={product.id}>
            <ProductCard product={product} showShopName={false} />
          </div>
        ))}
      </div>
    </Section>
  );
}
