import { FilterIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { CatalogResults } from "@/components/catalog/CatalogResults";
import { ShopCard } from "@/components/catalog/ShopCard";
import type { ShopSearch } from "@/components/catalog/types";
import { EmptyState } from "@/components/primitives/empty-state";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { PageHeader } from "@/components/primitives/page-header";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useGetShops } from "@/generated/hooks/useGetShops";

export const Route = createFileRoute("/shops/")({
  component: ShopsPage,
  validateSearch: (raw): ShopSearch => ({
    q: typeof raw.q === "string" ? raw.q : undefined,
  }),
});

function ShopsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const query = useGetShops();

  const handleSearchChange = (next: ShopSearch) => {
    navigate({ replace: true, search: next });
  };

  const shops = query.data || [];

  // Client-side filtering for 'q' until BE supports it
  const filteredShops = search.q
    ? shops.filter(
        (s) =>
          s.name.toLowerCase().includes(String(search.q).toLowerCase()) ||
          s.address.city.toLowerCase().includes(String(search.q).toLowerCase())
      )
    : shops;

  // TODO(WINE-XXX): cap at 20 until BE adds pagination
  const displayedShops = filteredShops.slice(0, 20);

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <PageHeader description="Find partner wine shops near you." title="Explore Shops" />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[280px_1fr]">
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger render={<Button className="w-full" size="sm" variant="outline" />}>
              <HugeiconsIcon className="mr-2 h-4 w-4" icon={FilterIcon} />
              Filters
            </SheetTrigger>
            <SheetContent className="w-[300px]" side="left">
              <div className="h-full overflow-y-auto px-4 py-8">
                <CatalogFilters
                  entity="shops"
                  onSearchChange={handleSearchChange}
                  search={search}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <aside className="hidden lg:block">
          <CatalogFilters entity="shops" onSearchChange={handleSearchChange} search={search} />
        </aside>

        <main>
          {query.isLoading ? (
            <LoadingState variant="catalog" />
          ) : query.isError ? (
            <ErrorState onRetry={() => query.refetch()} />
          ) : displayedShops.length === 0 ? (
            <EmptyState
              description="Try adjusting your filters to find what you're looking for."
              title="No shops found"
            />
          ) : (
            <CatalogResults count={filteredShops.length}>
              {displayedShops.map((shop) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </CatalogResults>
          )}
        </main>
      </div>
    </div>
  );
}
