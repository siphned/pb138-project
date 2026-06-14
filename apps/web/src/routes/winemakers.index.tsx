import { FilterIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { CatalogPagination } from "@/components/catalog/CatalogPagination";
import { CatalogResults } from "@/components/catalog/CatalogResults";
import { CatalogState } from "@/components/catalog/CatalogState";
import { asString, type WinemakerSearch } from "@/components/catalog/types";
import { WinemakerCard } from "@/components/catalog/WinemakerCard";
import { PageHeader } from "@/components/primitives/page-header";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useGetWinemakers } from "@/generated/hooks/useGetWinemakers";

type WinemakersSearch = WinemakerSearch & { page?: number };

export const Route = createFileRoute("/winemakers/")({
  component: WinemakersPage,
  validateSearch: (raw): WinemakersSearch => ({
    city: asString(raw.city),
    page: typeof raw.page === "number" && raw.page > 0 ? raw.page : undefined,
    q: asString(raw.q),
  }),
});

function WinemakersPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const query = useGetWinemakers({ city: search.city, page: search.page, q: search.q });

  const handleSearchChange = (next: WinemakerSearch) => {
    navigate({ replace: true, search: { ...next, page: undefined } });
  };

  const handlePageChange = (newPage: number) => {
    navigate({ replace: true, search: { ...search, page: newPage > 1 ? newPage : undefined } });
  };

  const winemakers = query.data?.data ?? [];
  const total = query.data?.total ?? 0;
  const page = search.page ?? 1;
  const limit = query.data?.limit ?? 24;

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

        <main className="space-y-6">
          <CatalogState
            emptyDescription="Try adjusting your filters to find what you're looking for."
            emptyTitle="No winemakers found"
            isEmpty={winemakers.length === 0}
            isError={query.isError}
            isLoading={query.isLoading}
            onRetry={() => query.refetch()}
          >
            <CatalogResults count={total}>
              {winemakers.map((winemaker) => (
                <WinemakerCard key={winemaker.id} winemaker={winemaker} />
              ))}
            </CatalogResults>
          </CatalogState>

          <CatalogPagination
            limit={limit}
            onPageChange={handlePageChange}
            page={page}
            total={total}
          />
        </main>
      </div>
    </div>
  );
}
