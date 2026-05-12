import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { ProductCard } from "@/components/catalog/ProductCard";
import { SearchSection } from "@/components/catalog/SearchSection";
import { ShopCard } from "@/components/catalog/ShopCard";
import { WineCard } from "@/components/catalog/WineCard";
import { WinemakerCard } from "@/components/catalog/WinemakerCard";
import { EmptyState } from "@/components/primitives/empty-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { PageHeader } from "@/components/primitives/page-header";
import { useGetProducts } from "@/generated/hooks/useGetProducts";
import { useGetShops } from "@/generated/hooks/useGetShops";
import { useGetWinemakers } from "@/generated/hooks/useGetWinemakers";
import { useGetWines } from "@/generated/hooks/useGetWines";

export const Route = createFileRoute("/search")({
  component: SearchPage,
  validateSearch: (search) => ({
    q: typeof search.q === "string" ? search.q : "",
  }),
});

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const winesQuery = useGetWines({ q: q || undefined });
  const productsQuery = useGetProducts({ q: q || undefined });
  const winemakersQuery = useGetWinemakers({ q: q || undefined });
  const shopsQuery = useGetShops({ q: q || undefined });

  const handleSearchChange = (next: Record<string, any>) => {
    navigate({ search: { q: next.q || "" }, replace: true });
  };

  const isLoading =
    winesQuery.isLoading ||
    productsQuery.isLoading ||
    winemakersQuery.isLoading ||
    shopsQuery.isLoading;

  const hasResults =
    (winesQuery.data?.length || 0) +
      (productsQuery.data?.data?.length || 0) +
      (winemakersQuery.data?.length || 0) +
      (shopsQuery.data?.length || 0) >
    0;

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <PageHeader
        description={q ? `Showing results for "${q}"` : "Search across the entire catalog."}
        title="Search"
      />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[280px_1fr]">
        <aside>
          <CatalogFilters
            entity="wines"
            onSearchChange={handleSearchChange}
            search={{ q }}
          />
        </aside>

        <main className="space-y-12">
          {isLoading ? (
            <LoadingState variant="catalog" />
          ) : !hasResults ? (
            <EmptyState
              description="We couldn't find anything matching your search."
              title="No results found"
            />
          ) : (
            <>
              <SearchSection
                count={winesQuery.data?.length || 0}
                heading="Wines"
                viewAllHref="/explore"
                viewAllSearch={{ q }}
              >
                {winesQuery.data?.slice(0, 3).map((wine) => (
                  <WineCard key={wine.id} wine={wine} />
                ))}
              </SearchSection>

              <SearchSection
                count={Number(productsQuery.data?.total || 0)}
                heading="Products"
                viewAllHref="/products"
                viewAllSearch={{ q }}
              >
                {productsQuery.data?.data?.slice(0, 3).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </SearchSection>

              <SearchSection
                count={winemakersQuery.data?.length || 0}
                heading="Winemakers"
                viewAllHref="/winemakers"
                viewAllSearch={{ q }}
              >
                {winemakersQuery.data?.slice(0, 3).map((winemaker) => (
                  <WinemakerCard key={winemaker.id} winemaker={winemaker} />
                ))}
              </SearchSection>

              <SearchSection
                count={shopsQuery.data?.length || 0}
                heading="Shops"
                viewAllHref="/shops"
                viewAllSearch={{ q }}
              >
                {shopsQuery.data?.slice(0, 3).map((shop) => (
                  <ShopCard key={shop.id} shop={shop} />
                ))}
              </SearchSection>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
