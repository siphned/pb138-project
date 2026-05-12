import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { CatalogResults } from "@/components/catalog/CatalogResults";
import { ProductCard } from "@/components/catalog/ProductCard";
import { EmptyState } from "@/components/primitives/empty-state";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { PageHeader } from "@/components/primitives/page-header";
import { useGetProducts } from "@/generated/hooks/useGetProducts";

export const Route = createFileRoute("/products/")({
  component: ProductsPage,
  validateSearch: (search) => ({
    isBundle: typeof search.isBundle === "boolean" ? search.isBundle : undefined,
    q: typeof search.q === "string" ? search.q : undefined,
    shopId: typeof search.shopId === "string" ? search.shopId : undefined,
    wineId: typeof search.wineId === "string" ? search.wineId : undefined,
  }),
});

function ProductsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const query = useGetProducts(search);

  const handleSearchChange = (next: Record<string, any>) => {
    navigate({ search: next, replace: true });
  };

  if (query.isLoading) {
    return (
      <div className="container mx-auto px-6 py-8 lg:px-12">
        <LoadingState variant="catalog" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="container mx-auto px-6 py-8 lg:px-12">
        <ErrorState onRetry={() => query.refetch()} />
      </div>
    );
  }

  const products = query.data?.data || [];

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <PageHeader description="Browse wines available for purchase." title="Products" />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[280px_1fr]">
        <aside>
          <CatalogFilters entity="products" onSearchChange={handleSearchChange} search={search} />
        </aside>

        <main>
          {products.length === 0 ? (
            <EmptyState
              description="Try adjusting your filters to find what you're looking for."
              title="No products found"
            />
          ) : (
            <CatalogResults count={products.length}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </CatalogResults>
          )}
        </main>
      </div>
    </div>
  );
}
