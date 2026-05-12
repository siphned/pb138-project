import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { CatalogResults } from "@/components/catalog/CatalogResults";
import { WineCard } from "@/components/catalog/WineCard";
import { EmptyState } from "@/components/primitives/empty-state";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { PageHeader } from "@/components/primitives/page-header";
import { useGetWines } from "@/generated/hooks/useGetWines";

export const Route = createFileRoute("/explore")({
  component: ExplorePage,
  validateSearch: (search) => ({
    color: typeof search.color === "string" ? search.color : undefined,
    q: typeof search.q === "string" ? search.q : undefined,
    region: typeof search.region === "string" ? search.region : undefined,
    winemakerId: typeof search.winemakerId === "string" ? search.winemakerId : undefined,
  }),
});

function ExplorePage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const query = useGetWines(search);

  const handleSearchChange = (next: Record<string, unknown>) => {
    navigate({ replace: true, search: next as any });
  };

  if (query.isLoading) {
    return (
      <div className="container mx-auto px-6 py-8 lg:px-12">
        <LoadingState variant="catalog" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="container mx-auto px-6 py-8 lg:px-12">
        <ErrorState onRetry={() => query.refetch()} />
      </div>
    );
  }

  const wines = query.data || [];

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <PageHeader description="Discover wines from independent winemakers." title="Explore wines" />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[280px_1fr]">
        <aside>
          <CatalogFilters entity="wines" onSearchChange={handleSearchChange} search={search} />
        </aside>

        <main>
          {wines.length === 0 ? (
            <EmptyState
              description="Try adjusting your filters to find what you're looking for."
              title="No wines found"
            />
          ) : (
            <CatalogResults count={wines.length}>
              {wines.map((wine) => (
                <WineCard key={wine.id} wine={wine} />
              ))}
            </CatalogResults>
          )}
        </main>
      </div>
    </div>
  );
}
