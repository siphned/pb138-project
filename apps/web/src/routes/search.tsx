import { FilterIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type React from "react";
import { ProductCard } from "@/components/catalog/ProductCard";
import { SearchPageFilters } from "@/components/catalog/SearchPageFilters";
import { SearchSection } from "@/components/catalog/SearchSection";
import { ShopCard } from "@/components/catalog/ShopCard";
import type { SearchPageSearch, WineSearch } from "@/components/catalog/types";
import { WineCard } from "@/components/catalog/WineCard";
import { WinemakerCard } from "@/components/catalog/WinemakerCard";
import { EmptyState } from "@/components/primitives/empty-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { PageHeader } from "@/components/primitives/page-header";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useGetProducts } from "@/generated/hooks/useGetProducts";
import { useGetShops } from "@/generated/hooks/useGetShops";
import { useGetWinemakers } from "@/generated/hooks/useGetWinemakers";
import { useGetWines } from "@/generated/hooks/useGetWines";
import {
  type GetWinesQueryParamsColorEnumKey,
  getWinesQueryParamsColorEnum,
} from "@/generated/types/GetWines";

const COLOR_VALUES = Object.values(getWinesQueryParamsColorEnum) as readonly string[];
const isColor = (v: unknown): v is GetWinesQueryParamsColorEnumKey =>
  typeof v === "string" && COLOR_VALUES.includes(v);

export const Route = createFileRoute("/search")({
  component: SearchPage,
  validateSearch: (raw): SearchPageSearch => ({
    color: isColor(raw.color) ? raw.color : undefined,
    isBundle: typeof raw.isBundle === "boolean" ? raw.isBundle : undefined,
    maxPrice:
      typeof raw.maxPrice === "string" || typeof raw.maxPrice === "number"
        ? raw.maxPrice
        : undefined,
    minPrice:
      typeof raw.minPrice === "string" || typeof raw.minPrice === "number"
        ? raw.minPrice
        : undefined,
    q: typeof raw.q === "string" ? raw.q : "",
    region: typeof raw.region === "string" ? raw.region : undefined,
  }),
});

function SearchPage() {
  const search = Route.useSearch();
  const { q = "" } = search;
  const navigate = useNavigate({ from: Route.fullPath });

  // Map search state to each endpoint's expected params
  const winesQuery = useGetWines({
    color: isColor(search.color) ? search.color : undefined,
    region: search.region,
  });

  const productsQuery = useGetProducts({
    color: search.color,
    maxPrice: search.maxPrice,
    minPrice: search.minPrice,
    region: search.region,
    search: q || undefined,
  });

  // Note: Winemakers and Shops don't support query params in current BE
  const winemakersQuery = useGetWinemakers();
  const shopsQuery = useGetShops();

  const handleSearchChange = (next: WineSearch) => {
    navigate({ replace: true, search: next });
  };

  const isLoading =
    winesQuery.isLoading ||
    productsQuery.isLoading ||
    winemakersQuery.isLoading ||
    shopsQuery.isLoading;

  // Client-side filtering for entities without BE search support
  const filteredWines = q
    ? (winesQuery.data || []).filter((w) => w.name.toLowerCase().includes(q.toLowerCase()))
    : winesQuery.data || [];

  const filteredWinemakers = q
    ? (winemakersQuery.data || []).filter((w) => w.name.toLowerCase().includes(q.toLowerCase()))
    : winemakersQuery.data || [];

  const filteredShops = q
    ? (shopsQuery.data || []).filter(
        (s) =>
          s.name.toLowerCase().includes(q.toLowerCase()) ||
          s.address.city.toLowerCase().includes(q.toLowerCase())
      )
    : shopsQuery.data || [];

  const wineCount = filteredWines.length;
  const products = productsQuery.data?.data || [];
  const productCount = Number(productsQuery.data?.total || 0);
  const winemakerCount = filteredWinemakers.length;
  const shopCount = filteredShops.length;

  const hasResults = wineCount + productCount + winemakerCount + shopCount > 0;

  let content: React.ReactNode;
  if (isLoading) {
    content = <LoadingState variant="catalog" />;
  } else if (!hasResults) {
    content = (
      <EmptyState
        description="We couldn't find anything matching your search."
        title="No results found"
      />
    );
  } else {
    content = (
      <>
        <SearchSection
          count={wineCount}
          heading="Wines"
          viewAllHref="/explore"
          viewAllSearch={{ ...search }}
        >
          {filteredWines.slice(0, 3).map((wine) => (
            <WineCard key={wine.id} wine={wine} />
          ))}
        </SearchSection>

        <SearchSection
          count={productCount}
          heading="Products"
          viewAllHref="/products"
          viewAllSearch={{ ...search, search: q || undefined }}
        >
          {products.slice(0, 3).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </SearchSection>

        <SearchSection
          count={winemakerCount}
          heading="Winemakers"
          viewAllHref="/winemakers"
          viewAllSearch={{ q }}
        >
          {filteredWinemakers.slice(0, 3).map((winemaker) => (
            <WinemakerCard key={winemaker.id} winemaker={winemaker} />
          ))}
        </SearchSection>

        <SearchSection count={shopCount} heading="Shops" viewAllHref="/shops" viewAllSearch={{ q }}>
          {filteredShops.slice(0, 3).map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </SearchSection>
      </>
    );
  }

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <PageHeader
        description={q ? `Showing results for "${q}"` : "Search across the entire catalog."}
        title="Search"
      />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[280px_1fr]">
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger render={<Button className="w-full" size="sm" variant="outline" />}>
              <HugeiconsIcon className="mr-2 h-4 w-4" icon={FilterIcon} />
              Filters
            </SheetTrigger>
            <SheetContent className="w-75" side="left">
              <div className="h-full overflow-y-auto px-4 py-8">
                <SearchPageFilters onSearchChange={handleSearchChange} search={search} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <aside className="hidden lg:block">
          <SearchPageFilters onSearchChange={handleSearchChange} search={search} />
        </aside>

        <main className="space-y-12">{content}</main>
      </div>
    </div>
  );
}
