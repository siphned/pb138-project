import { FilterIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { CatalogResults } from "@/components/catalog/CatalogResults";
import { CatalogState } from "@/components/catalog/CatalogState";
import type { ShopSearch } from "@/components/catalog/types";
import { PageHeader } from "@/components/primitives/page-header";
import { ShopCard } from "@/components/shops/ShopCard";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useGetShops } from "@/generated/hooks/useGetShops";

export const Route = createFileRoute("/shops/")({
  component: ShopsPage,
  validateSearch: (raw): ShopSearch => ({
    city: typeof raw.city === "string" ? raw.city : undefined,
    ownerUserId: typeof raw.ownerUserId === "string" ? raw.ownerUserId : undefined,
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

  // Client-side filtering until BE supports it
  const filteredShops = useMemo(() => {
    const cityFilter = search.city?.toLowerCase();
    const qFilter = search.q?.toLowerCase();
    return shops.filter((s) => {
      const city = s.address?.city?.toLowerCase() ?? "";
      if (qFilter && !s.name.toLowerCase().includes(qFilter) && !city.includes(qFilter)) {
        return false;
      }
      if (cityFilter && !city.includes(cityFilter)) {
        return false;
      }
      if (search.ownerUserId && s.ownerUserId !== search.ownerUserId) {
        return false;
      }
      return true;
    });
  }, [shops, search.city, search.ownerUserId, search.q]);

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
          <CatalogState
            emptyDescription="Try adjusting your filters to find what you're looking for."
            emptyTitle="No shops found"
            isEmpty={displayedShops.length === 0}
            isError={query.isError}
            isLoading={query.isLoading}
            onRetry={() => query.refetch()}
          >
            <CatalogResults count={filteredShops.length}>
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
