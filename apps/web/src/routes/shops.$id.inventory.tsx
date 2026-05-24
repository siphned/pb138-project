import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CatalogResults } from "@/components/catalog/CatalogResults";
import { CatalogState } from "@/components/catalog/CatalogState";
import { ProductCard } from "@/components/catalog/ProductCard";
import { PageHeader } from "@/components/primitives/page-header";
import { Button } from "@/components/ui/button";
import { useGetProducts } from "@/generated/hooks/useGetProducts";

function parseIsBundle(v: unknown): boolean | undefined {
  if (v === "true" || v === true) return true;
  if (v === "false" || v === false) return false;
  return undefined;
}

export const Route = createFileRoute("/shops/$id/inventory")({
  component: ShopInventoryPage,
  validateSearch: (search) => ({
    isBundle: parseIsBundle(search.isBundle),
  }),
});

function ShopInventoryPage() {
  const { id } = Route.useParams();
  const { isBundle } = Route.useSearch();
  const navigate = Route.useNavigate();

  const query = useGetProducts({ isBundle, shopId: id });
  const products = query.data?.data || [];
  const total = Number(query.data?.total || 0);

  const setIsBundle = (value: boolean | undefined) => {
    navigate({ replace: true, search: { isBundle: value } });
  };

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <PageHeader
        actions={
          <Button
            render={
              <Link
                params={{ id }}
                search={{ isBundle: undefined }}
                to="/shops/$id/inventory/new"
              />
            }
            size="sm"
          >
            <HugeiconsIcon className="mr-2 h-4 w-4" icon={PlusSignIcon} />
            Add Product
          </Button>
        }
        description="Manage your shop's products and bundles."
        title="Shop Inventory"
      />

      {/* Toggle tabs */}
      <div className="flex gap-2 rounded-lg border border-border bg-muted p-1 w-fit">
        <button
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            isBundle === undefined
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setIsBundle(undefined)}
          type="button"
        >
          All
        </button>
        <button
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            isBundle === false
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setIsBundle(false)}
          type="button"
        >
          Products
        </button>
        <button
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            isBundle === true
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setIsBundle(true)}
          type="button"
        >
          Bundles
        </button>
      </div>

      <CatalogState
        emptyDescription="Add products to your inventory to start selling."
        emptyTitle="No products found"
        isEmpty={products.length === 0}
        isError={query.isError}
        isLoading={query.isLoading}
        onRetry={() => query.refetch()}
      >
        <CatalogResults count={total}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </CatalogResults>
      </CatalogState>
    </div>
  );
}
