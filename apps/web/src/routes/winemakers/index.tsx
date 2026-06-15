import { FilterIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/primitives/page-header";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useGetWinemakers } from "@/generated/hooks/useGetWinemakers";
import { CatalogFilters } from "@/routes/-components/CatalogFilters";
import { CatalogResults } from "@/routes/-components/CatalogResults";
import { CatalogState } from "@/routes/-components/CatalogState";
import { asString, type WinemakerSearch } from "@/routes/-components/types";
import { WinemakerCard } from "@/routes/-components/WinemakerCard";

export const Route = createFileRoute("/winemakers/")({
  component: WinemakersPage,
  validateSearch: (raw): WinemakerSearch => ({
    city: asString(raw.city),
    q: asString(raw.q),
  }),
});

function WinemakersPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const query = useGetWinemakers({ city: search.city, q: search.q });

  const handleSearchChange = (next: WinemakerSearch) => {
    navigate({ replace: true, search: next });
  };

  const winemakers = query.data || [];

  // TODO(WINE-XXX): cap at 20 until BE adds pagination
  const displayedWinemakers = winemakers.slice(0, 20);

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <PageHeader description="Meet the people behind the wine." title="Winemakers" />

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
                  entity="winemakers"
                  onSearchChange={handleSearchChange}
                  search={search}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <aside className="hidden lg:block">
          <CatalogFilters entity="winemakers" onSearchChange={handleSearchChange} search={search} />
        </aside>

        <main>
          <CatalogState
            emptyDescription="Try adjusting your filters to find what you're looking for."
            emptyTitle="No winemakers found"
            isEmpty={displayedWinemakers.length === 0}
            isError={query.isError}
            isLoading={query.isLoading}
            onRetry={() => query.refetch()}
          >
            <CatalogResults count={winemakers.length}>
              {displayedWinemakers.map((winemaker) => (
                <WinemakerCard key={winemaker.id} winemaker={winemaker} />
              ))}
            </CatalogResults>
          </CatalogState>
        </main>
      </div>
    </div>
  );
}
