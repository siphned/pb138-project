import { FilterIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
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
import { CatalogFilters } from "@/routes/-components/CatalogFilters";
import { CatalogPagination } from "@/routes/-components/CatalogPagination";
import { CatalogResults } from "@/routes/-components/CatalogResults";
import { CatalogState } from "@/routes/-components/CatalogState";
import { asNumOrStr, type WineSearch } from "@/routes/-components/types";
import { WineCard } from "@/routes/-components/WineCard";

const COLOR_VALUES = Object.values(getWinesQueryParamsColorEnum) as readonly string[];
const isColor = (v: unknown): v is GetWinesQueryParamsColorEnumKey =>
  typeof v === "string" && COLOR_VALUES.includes(v);

const TYPE_VALUES = Object.values(getWinesQueryParamsTypeEnum) as readonly string[];
const isWineType = (v: unknown): v is GetWinesQueryParamsTypeEnumKey =>
  typeof v === "string" && TYPE_VALUES.includes(v);

const PAGE_SIZE = 24;

type WinesSearch = WineSearch & { page?: number };

export const Route = createFileRoute("/wines/")({
  component: WinesListPage,
  validateSearch: (raw): WinesSearch => ({
    color: isColor(raw.color) ? raw.color : undefined,
    page: typeof raw.page === "number" && raw.page > 0 ? raw.page : undefined,
    q: typeof raw.q === "string" ? raw.q : undefined,
    region: typeof raw.region === "string" ? raw.region : undefined,
    type: isWineType(raw.type) ? raw.type : undefined,
    vintageYear: asNumOrStr(raw.vintageYear),
    winemakerId: typeof raw.winemakerId === "string" ? raw.winemakerId : undefined,
  }),
});

function WinesListPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  // BE doesn't support `q` or `page` on /wines yet — strip them before the API call,
  // handle both client-side until WINE-XXX adds pagination to /wines.
  const { q, page: _page, ...apiSearchParams } = search;
  const query = useGetWines(apiSearchParams);
  const page = search.page ?? 1;

  const handleSearchChange = (next: WineSearch) => {
    // Reset to page 1 whenever filters change.
    navigate({ replace: true, search: { ...next, page: undefined } });
  };

  const handlePageChange = (nextPage: number) => {
    navigate({ replace: true, search: { ...search, page: nextPage > 1 ? nextPage : undefined } });
  };

  const wines = useMemo(() => query.data ?? [], [query.data]);

  const filteredWines = useMemo(() => {
    if (!q) return wines;
    const needle = String(q).toLowerCase();
    return wines.filter((w) => w.name.toLowerCase().includes(needle));
  }, [wines, q]);

  const totalPages = Math.max(1, Math.ceil(filteredWines.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageWines = filteredWines.slice(pageStart, pageStart + PAGE_SIZE);

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <PageHeader description="Discover wines from independent winemakers." title="All wines" />

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

        <main className="space-y-6">
          <CatalogState
            emptyDescription="Try adjusting your filters to find what you're looking for."
            emptyTitle="No wines found"
            isEmpty={filteredWines.length === 0}
            isError={query.isError}
            isLoading={query.isLoading}
            onRetry={() => query.refetch()}
          >
            <CatalogResults count={filteredWines.length}>
              {pageWines.map((wine) => (
                <WineCard key={wine.id} wine={wine} />
              ))}
            </CatalogResults>
          </CatalogState>

          <CatalogPagination
            limit={PAGE_SIZE}
            onPageChange={handlePageChange}
            page={safePage}
            total={filteredWines.length}
          />
        </main>
      </div>
    </div>
  );
}
