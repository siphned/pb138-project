import { FilterIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { CatalogResults } from "@/components/catalog/CatalogResults";
import { CatalogState } from "@/components/catalog/CatalogState";
import type { WineSearch } from "@/components/catalog/types";
import { WineCard } from "@/components/catalog/WineCard";
import { PageHeader } from "@/components/primitives/page-header";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useGetWines } from "@/generated/hooks/useGetWines";
import {
  type GetWinesQueryParamsColorEnumKey,
  type GetWinesQueryParamsTypeEnumKey,
  getWinesQueryParamsColorEnum,
  getWinesQueryParamsTypeEnum,
} from "@/generated/types/GetWines";

const COLOR_VALUES = Object.values(getWinesQueryParamsColorEnum) as readonly string[];
const isColor = (v: unknown): v is GetWinesQueryParamsColorEnumKey =>
  typeof v === "string" && COLOR_VALUES.includes(v);

const TYPE_VALUES = Object.values(getWinesQueryParamsTypeEnum) as readonly string[];
const isWineType = (v: unknown): v is GetWinesQueryParamsTypeEnumKey =>
  typeof v === "string" && TYPE_VALUES.includes(v);

export const Route = createFileRoute("/explore")({
  component: ExplorePage,
  validateSearch: (raw): WineSearch => ({
    color: isColor(raw.color) ? raw.color : undefined,
    q: typeof raw.q === "string" ? raw.q : undefined,
    region: typeof raw.region === "string" ? raw.region : undefined,
    type: isWineType(raw.type) ? raw.type : undefined,
    vintageYear:
      typeof raw.vintageYear === "string" || typeof raw.vintageYear === "number"
        ? raw.vintageYear
        : undefined,
    winemakerId: typeof raw.winemakerId === "string" ? raw.winemakerId : undefined,
  }),
});

function ExplorePage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  // Strip 'q' before passing to API hook — BE doesn't expose full-text search on /wines yet.
  const { q, ...apiSearchParams } = search;
  const query = useGetWines(apiSearchParams);

  const handleSearchChange = (next: WineSearch) => {
    navigate({ replace: true, search: next });
  };

  const wines = query.data || [];

  // Client-side filtering for 'q' until BE supports it
  const filteredWines = q
    ? wines.filter((w) => w.name.toLowerCase().includes(String(q).toLowerCase()))
    : wines;

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <PageHeader description="Discover wines from independent winemakers." title="Explore wines" />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[280px_1fr]">
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger render={<Button className="w-full" size="sm" variant="outline" />}>
              <HugeiconsIcon className="mr-2 h-4 w-4" icon={FilterIcon} />
              Filters
            </SheetTrigger>
            <SheetContent className="w-[300px]" side="left">
              <div className="py-8 px-4 h-full overflow-y-auto">
                <CatalogFilters
                  entity="wines"
                  onSearchChange={handleSearchChange}
                  search={search}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <aside className="hidden lg:block">
          <CatalogFilters entity="wines" onSearchChange={handleSearchChange} search={search} />
        </aside>

        <main>
          <CatalogState
            emptyDescription="Try adjusting your filters to find what you're looking for."
            emptyTitle="No wines found"
            isEmpty={filteredWines.length === 0}
            isError={query.isError}
            isLoading={query.isLoading}
            onRetry={() => query.refetch()}
          >
            <CatalogResults count={filteredWines.length}>
              {filteredWines.map((wine) => (
                <WineCard key={wine.id} wine={wine} />
              ))}
            </CatalogResults>
          </CatalogState>
        </main>
      </div>
    </div>
  );
}
