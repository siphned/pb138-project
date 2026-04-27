import { useNavigate } from "@tanstack/react-router";
import { Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// TEMP: GET /products not yet implemented — using GET /wines as standin.
// Swap back to useGetProducts once backend implements the endpoint.
import { useGetShopsByIdProducts } from "@/generated/hooks/productsController/useGetShopsByIdProducts";
import { useGetWines } from "@/generated/hooks/useGetWines";
import { WineCard } from "./WineCard";
import { WineFiltersSidebar } from "./WineFiltersSidebar";

interface WineCatalogProps {
  search: {
    color?: string[];
    maxPrice?: number;
    minPrice?: number;
    page?: number;
    rating?: number;
    region?: string[];
    search?: string;
    sort?: string;
    type?: string[];
  };
  shopId?: string;
  shopName?: string;
}

export function WineCatalog({ search, shopId, shopName }: WineCatalogProps) {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(search.search ?? "");

  const winesResult = useGetWines({
    color:
      typeof search.color === "string"
        ? (search.color as "red" | "white" | "rosé" | "orange" | undefined)
        : (search.color?.[0] as "red" | "white" | "rosé" | "orange" | undefined),
    region: typeof search.region === "string" ? search.region : search.region?.[0],
    type:
      typeof search.type === "string"
        ? (search.type as "still" | "sparkling" | "fortified" | "dessert" | undefined)
        : (search.type?.[0] as "still" | "sparkling" | "fortified" | "dessert" | undefined),
  });

  const shopProductsResult = useGetShopsByIdProducts(shopId ?? "", { isBundle: "false" });

  const { data: rawData, isLoading, error } = shopId ? shopProductsResult : winesResult;

  type RawProductItem = {
    color?: string;
    createdAt?: string;
    description?: string | null;
    id: string;
    name: string;
    price?: string;
    quantity?: number | string;
    rating?: number | string | null;
    region?: string;
    reviewCount?: number | string | null;
    shop?: { name?: string };
    shopId?: string;
    type?: string;
    updatedAt?: string | null;
    vintageYear?: number | string;
    winemaker?: unknown;
    wines?: unknown[];
  };

  const products = Array.isArray(rawData)
    ? (rawData as RawProductItem[]).map((item) => ({
        createdAt: item.createdAt,
        description: item.description ?? null,
        id: item.id,
        isBundle: false as const,
        name: item.name,
        price: item.price ?? "0",
        quantity: Number(item.quantity),
        rating: Number(item.rating ?? 0),
        reviewCount: Number(item.reviewCount ?? 0),
        shopId: item.shopId ?? shopId ?? "",
        shopName: item.shop?.name ?? undefined,
        updatedAt: item.updatedAt ?? null,
        wines: Array.isArray(item.wines)
          ? item.wines
          : [
              {
                color: item.color,
                id: item.id,
                name: item.name,
                region: item.region,
                type: item.type,
                vintageYear: Number(item.vintageYear),
                winemaker: item.winemaker,
              },
            ],
      }))
    : undefined;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (search.search ?? "")) {
        navigate({
          search: { ...search, page: 1, search: searchInput || undefined },
          to: "/wines",
        });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, search, navigate]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {["s1", "s2", "s3", "s4", "s5", "s6"].map((s) => (
            <div className="h-[400px] w-full animate-pulse rounded-2xl bg-secondary/20" key={s} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="font-bold text-destructive">Error loading products.</p>
          <Button onClick={() => window.location.reload()} variant="link">
            Try again
          </Button>
        </div>
      );
    }

    if (!Array.isArray(products) || products.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center space-y-4 py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary/20">
            <SearchIcon className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold">No products found</h3>
          <p className="max-w-xs text-muted-foreground">Try adjusting or clearing your filters.</p>
          <Button onClick={() => navigate({ search: { page: 1, sort: "newest" }, to: "/wines" })}>
            Clear all filters
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <WineCard
            key={product.id}
            product={product}
            shopName={shopId ? undefined : product.shopName}
          />
        ))}
      </div>
    );
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-6 py-8 lg:px-12">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar — desktop only */}
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <WineFiltersSidebar search={search} />
          </aside>

          {/* Main content */}
          <div className="flex-1 space-y-6">
            <h1 className="font-heading text-3xl font-bold">
              {shopId ? `${shopName ?? "Shop"}'s Wines` : "Explore Wines"}
            </h1>
            {/* Top bar */}
            <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-secondary/10 p-4 md:flex-row">
              <div className="relative w-full md:w-96">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="rounded-xl border-none bg-background pl-10"
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search wines or winemakers..."
                  value={searchInput}
                />
              </div>

              <div className="flex w-full items-center gap-4 md:w-auto">
                {/* Mobile filter sheet */}
                <Sheet>
                  <SheetTrigger
                    render={
                      <Button className="flex-1 rounded-xl lg:hidden" variant="outline">
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        Filters
                      </Button>
                    }
                  />
                  <SheetContent className="w-[300px] overflow-y-auto" side="left">
                    <WineFiltersSidebar search={search} />
                  </SheetContent>
                </Sheet>

                <Select
                  onValueChange={(value) =>
                    navigate({ search: { ...search, page: 1, sort: value }, to: "/wines" })
                  }
                  value={String(search.sort ?? "newest")}
                >
                  <SelectTrigger className="w-full rounded-md border-none bg-secondary md:w-35 font-medium">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Result count */}
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-bold text-foreground">{products?.length ?? 0}</span>{" "}
              products
            </p>

            {renderContent()}

            {/* Load more */}
            {products && products.length >= 12 && (
              <div className="flex justify-center pt-8">
                <Button
                  className="rounded-full px-8"
                  onClick={() =>
                    navigate({
                      search: { ...search, page: (Number(search.page) || 1) + 1 },
                      to: "/wines",
                    })
                  }
                  variant="outline"
                >
                  Load More
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
