import { FilterIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { CatalogResults } from "@/components/catalog/CatalogResults";
import { CatalogState } from "@/components/catalog/CatalogState";
import type { WinemakerSearch } from "@/components/catalog/types";
import { WinemakerCard } from "@/components/catalog/WinemakerCard";
import { PageHeader } from "@/components/primitives/page-header";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useGetWinemakers } from "@/generated/hooks/useGetWinemakers";

export const Route = createFileRoute("/winemakers/")({
  component: WinemakersPage,
  validateSearch: (raw): WinemakerSearch => ({
    q: typeof raw.q === "string" ? raw.q : undefined,
  }),
});

function WinemakersPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const query = useGetWinemakers();

  const handleSearchChange = (next: WinemakerSearch) => {
    navigate({ replace: true, search: next });
  };

  const winemakers = query.data || [];

  // Client-side filtering for 'q' until BE supports it
  const filteredWinemakers = search.q
    ? winemakers.filter((w) => w.name.toLowerCase().includes(String(search.q).toLowerCase()))
    : winemakers;

  // TODO(WINE-XXX): cap at 20 until BE adds pagination
  const displayedWinemakers = filteredWinemakers.slice(0, 20);

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
            <CatalogResults count={filteredWinemakers.length}>
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
