import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SearchIcon, StoreIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { ShopCard } from "@/components/catalog/ShopCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetShops } from "@/generated/hooks/useGetShops";
import { useDebounce } from "@/hooks/use-debounce";

const searchSchema = z.object({ search: z.string().optional() });

export const Route = createFileRoute("/shops/")({
  component: ShopsPage,
  validateSearch: (s) => searchSchema.parse(s),
});

function ShopsPage() {
  const { search } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [searchValue, setSearchValue] = useState(search ?? "");
  const debouncedSearch = useDebounce(searchValue, 500);

  const { data: shops, isLoading, isError, refetch } = useGetShops();

  useEffect(() => {
    navigate({ replace: true, search: { search: debouncedSearch || undefined } });
  }, [debouncedSearch, navigate]);

  const filteredShops = shops?.filter(
    (s) =>
      !debouncedSearch ||
      s.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      s.address.city.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
      <div className="container mx-auto px-6 py-8 lg:px-12">
        <h1 className="font-heading text-4xl font-bold mb-8">Explore Shops</h1>

        <div className="relative mb-8 max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10 rounded-xl"
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search shops..."
            value={searchValue}
          />
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div className="h-[300px] w-full animate-pulse rounded-2xl bg-secondary/20" key={i} />
            ))}
          </div>
        )}

        {!isLoading && isError && (
          <div className="flex flex-col items-center py-12 text-center">
            <p className="font-bold text-destructive">Failed to load shops. Please try again.</p>
            <Button onClick={() => refetch()} variant="link">
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !isError && filteredShops && filteredShops.length > 0 && (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">Showing {filteredShops.length} shops</p>
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredShops.map((shop) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          </div>
        )}

        {!isLoading && !isError && filteredShops && filteredShops.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/20">
              <StoreIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-heading font-bold">No shops found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms.</p>
          </div>
        )}
      </div>
  );
}
