import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { CatalogResults } from "@/components/catalog/CatalogResults";
import { WinemakerCard } from "@/components/catalog/WinemakerCard";
import { EmptyState } from "@/components/primitives/empty-state";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { PageHeader } from "@/components/primitives/page-header";
import { useGetWinemakers } from "@/generated/hooks/useGetWinemakers";

export const Route = createFileRoute("/winemakers/")({
  component: WinemakersPage,
  validateSearch: (search) => ({
    q: typeof search.q === "string" ? search.q : undefined,
    region: typeof search.region === "string" ? search.region : undefined,
  }),
});

function WinemakersPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const query = useGetWinemakers(search);

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

  const winemakers = query.data || [];

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <PageHeader description="Meet the people behind the wine." title="Winemakers" />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[280px_1fr]">
        <aside>
          <CatalogFilters entity="winemakers" onSearchChange={handleSearchChange} search={search} />
        </aside>

        <main>
          {winemakers.length === 0 ? (
            <EmptyState
              description="Try adjusting your filters to find what you're looking for."
              title="No winemakers found"
            />
          ) : (
            <CatalogResults count={winemakers.length}>
              {winemakers.map((winemaker) => (
                <WinemakerCard key={winemaker.id} winemaker={winemaker} />
              ))}
            </CatalogResults>
          )}
        </main>
      </div>
    </div>
  );
}
