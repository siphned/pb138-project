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
import type { GetProductsParams } from "@/generated/model";
import { useGetProducts } from "@/generated/products/products";
import { WineCard } from "./WineCard";
import { WineFiltersSidebar } from "./WineFiltersSidebar";

interface WineCatalogProps {
  search: GetProductsParams;
}

export function WineCatalog({ search }: WineCatalogProps) {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(search.search || "");

  const { data: products, isLoading, error } = useGetProducts(search);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (search.search || "")) {
        navigate({
          to: "/wines",
          search: { ...search, search: searchInput || undefined, page: 1 },
        });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, search, navigate]);

  const handleSortChange = (value: string | null) => {
    if (value) {
      navigate({ to: "/wines", search: { ...search, sort: value, page: 1 } });
    }
  };

  return (
    <PublicLayout>
      <div className="container mx-auto px-6 lg:px-12 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <WineFiltersSidebar search={search} />
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Top Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-secondary/10 p-4 rounded-2xl">
              <div className="relative w-full md:w-96">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search wines or winemakers..."
                  className="pl-10 bg-background border-none rounded-xl"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                {/* Mobile Filter Trigger */}
                <Sheet>
                  <SheetTrigger
                    render={
                      <Button variant="outline" className="lg:hidden flex-1 rounded-xl">
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        Filters
                      </Button>
                    }
                  />
                  <SheetContent side="left" className="w-[300px] overflow-y-auto">
                    <WineFiltersSidebar search={search} />
                  </SheetContent>
                </Sheet>

                <Select value={search.sort} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-full md:w-[180px] bg-background border-none rounded-xl">
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

            {/* Results Info */}
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-bold text-foreground">{products?.length || 0}</span>{" "}
              products
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {["s1", "s2", "s3", "s4", "s5", "s6"].map((s) => (
                  <div
                    key={s}
                    className="h-[400px] w-full rounded-2xl bg-secondary/20 animate-pulse"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-destructive font-bold">Error loading products.</p>
                <Button variant="link" onClick={() => window.location.reload()}>
                  Try again
                </Button>
              </div>
            ) : products?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="h-20 w-20 bg-secondary/20 rounded-full flex items-center justify-center">
                  <SearchIcon className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold">No products found</h3>
                <p className="text-muted-foreground max-w-xs">
                  We couldn't find any wines matching your current filters. Try clearing some
                  filters.
                </p>
                <Button
                  onClick={() => navigate({ to: "/wines", search: { sort: "newest", page: 1 } })}
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {products?.map((product) => (
                  <WineCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination Placeholder */}
            {products && products.length >= 12 && (
              <div className="flex justify-center pt-8">
                <Button
                  variant="outline"
                  onClick={() => {
                    const currentPage = Number(search.page) || 1;
                    navigate({
                      to: "/wines",
                      search: { ...search, page: currentPage + 1 },
                    });
                  }}
                  className="rounded-full px-8"
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
