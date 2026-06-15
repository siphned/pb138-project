import { FilterIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/primitives/page-header";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useGetShops } from "@/generated/hooks/useGetShops";
import { CatalogFilters } from "@/routes/-components/CatalogFilters";
import { CatalogResults } from "@/routes/-components/CatalogResults";
import { CatalogState } from "@/routes/-components/CatalogState";
import { ShopCard } from "@/routes/-components/ShopCard";
import { asString, type ShopSearch } from "@/routes/-components/types";

export const Route = createFileRoute("/shops/")({
  component: ShopsPage,
  validateSearch: (raw): ShopSearch => ({
    city: asString(raw.city),
    q: asString(raw.q),
  }),
});

function ShopsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const query = useGetShops({ city: search.city, q: search.q });

  const handleSearchChange = (next: ShopSearch) => {
    navigate({ replace: true, search: next });
  };

  const shops = query.data || [];

  // TODO(WINE-XXX): cap at 20 until BE adds pagination
  const displayedShops = shops.slice(0, 20);

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
          <CatalogState
            emptyDescription="Try adjusting your filters to find what you're looking for."
            emptyTitle="No shops found"
            isEmpty={displayedShops.length === 0}
            isError={query.isError}
            isLoading={query.isLoading}
            onRetry={() => query.refetch()}
          >
            <CatalogResults count={shops.length}>
              {displayedShops.map((shop) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </CatalogResults>
          </CatalogState>
        </main>
      </div>
    </div>
  );
}
