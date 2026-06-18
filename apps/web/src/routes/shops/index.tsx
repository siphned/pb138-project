import { FilterIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader } from "@/components/primitives/page-header";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useGetShops } from "@/generated/hooks/useGetShops";
import { CatalogFilters } from "@/routes/-components/CatalogFilters";
import { CatalogPagination } from "@/routes/-components/CatalogPagination";
import { CatalogResults } from "@/routes/-components/CatalogResults";
import { CatalogState } from "@/routes/-components/CatalogState";
import { ShopCard } from "@/routes/-components/ShopCard";
import { asString, type ShopSearch } from "@/routes/-components/types";

type ShopsSearch = ShopSearch & { page?: number; ownerUserId?: string };

export const Route = createFileRoute("/shops/")({
  component: ShopsPage,
  validateSearch: (raw): ShopsSearch => ({
    city: asString(raw.city),
    ownerUserId: asString(raw.ownerUserId),
    page: typeof raw.page === "number" && raw.page > 0 ? raw.page : undefined,
    q: asString(raw.q),
  }),
});

function ShopsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const query = useGetShops({
    city: search.city,
    ownerUserId: search.ownerUserId,
    page: search.page,
    q: search.q,
  });

  const handleSearchChange = (next: ShopSearch) => {
    navigate({
      replace: true,
      search: { ...next, ownerUserId: search.ownerUserId, page: undefined },
    });
  };

  const handlePageChange = (newPage: number) => {
    navigate({ replace: true, search: { ...search, page: newPage > 1 ? newPage : undefined } });
  };

  const shops = query.data?.data ?? [];
  const total = query.data?.total ?? 0;
  const page = search.page ?? 1;
  const limit = query.data?.limit ?? 24;

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

        <main className="space-y-6">
          <CatalogState
            emptyDescription="Try adjusting your filters to find what you're looking for."
            emptyTitle="No shops found"
            isEmpty={shops.length === 0}
            isError={query.isError}
            isLoading={query.isLoading}
            onRetry={() => query.refetch()}
          >
            <CatalogResults count={total}>
              {shops.map((shop) => (
                <ShopCard key={shop.id} shop={shop} />
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
