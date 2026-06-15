import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { Section } from "@/components/primitives/section";
import { Button } from "@/components/ui/button";
import { useGetProducts } from "@/generated/hooks/useGetProducts";
import { ProductCard } from "@/routes/-components/ProductCard";

interface ShopProductsRowProps {
  shopId: string;
  isBundle?: boolean;
}

export function ShopProductsRow({ shopId, isBundle }: ShopProductsRowProps) {
  const {
    data: rawData,
    isLoading,
    isError,
    refetch,
  } = useGetProducts({
    isBundle: isBundle ? isBundle : false,
    shopId,
  });
  const data = rawData?.data;

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

  const items = (data ?? []).slice(0, 10);

  if (items.length === 0) {
    return null; // Don't render the section if empty
  }

  const title = isBundle ? "Wine Bundles" : "Top Selling Wines";

  return (
    <Section heading={title}>
      <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((product) => (
          <div className="w-[280px] shrink-0 snap-start" key={product.id}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          className="rounded-full px-8 py-6 text-sm font-bold uppercase tracking-widest transition-all hover:scale-105"
          render={<Link params={{}} search={{ isBundle: !!isBundle, shopId }} to="/products" />}
          variant="outline"
        >
          View all inventory
          <HugeiconsIcon className="ml-2 h-4 w-4" icon={ArrowRight01Icon} />
        </Button>
      </div>
    </Section>
  );
}
