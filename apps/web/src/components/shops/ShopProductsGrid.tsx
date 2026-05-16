import { ProductCard } from "@/components/catalog/ProductCard";
import { DataGrid } from "@/components/primitives/data-grid";
import { EmptyState } from "@/components/primitives/empty-state";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { useGetShopsByIdProducts } from "@/generated/hooks/useGetShopsByIdProducts";

interface ShopProductsGridProps {
  shopId: string;
  isBundle?: boolean;
}

export function ShopProductsGrid({ shopId, isBundle }: ShopProductsGridProps) {
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
        message="Failed to load products for this shop."
        onRetry={() => refetch()}
        title="Error loading products"
      />
    );
  }

  const products = data || [];

  if (products.length === 0) {
    return (
      <EmptyState
        description={
          isBundle
            ? "This shop doesn't have any wine bundles yet."
            : "This shop doesn't have any products yet."
        }
        title="No products found"
      />
    );
  }

  return (
    <DataGrid variant="catalog">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </DataGrid>
  );
}
