import { useNavigate } from "@tanstack/react-router";
import { Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useGetProducts } from "@/generated/hooks/useGetProducts";
import { WineCard } from "./WineCard";
import { WineFiltersSidebar } from "./WineFiltersSidebar";

interface WineCatalogProps {
  mode?: "wines" | "bundles";
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

type CatalogProduct = {
  createdAt: string;
  description: string | null;
  id: string;
  isBundle: boolean;
  name: string;
  price: string;
  quantity: number;
  rating: number;
  reviewCount: number;
  shopId: string;
  shopName?: string;
  updatedAt: string | null;
  wines: {
    id: string;
    name: string;
    region: string;
    vintageYear: string | number;
    type: string;
    color: string;
    winemaker: { id: string; name: string };
  }[];
};

const matchesText = (product: CatalogProduct, query?: string) => {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    product.name.toLowerCase().includes(q) ||
    (product.wines?.[0]?.winemaker?.name.toLowerCase().includes(q) ?? false)
  );
};

const matchesAttributes = (product: CatalogProduct, search: WineCatalogProps["search"]) => {
  const wine = product.wines?.[0];
  const { color, type, region } = search;

  if (color?.length && !color.some((c) => wine?.color?.toLowerCase().includes(c.toLowerCase())))
    return false;
  if (type?.length && !type.some((t) => wine?.type?.toLowerCase().includes(t.toLowerCase())))
    return false;
  if (region?.length && !region.some((r) => wine?.region === r)) return false;

  return true;
};

const matchesStats = (product: CatalogProduct, search: WineCatalogProps["search"]) => {
  const { minPrice, maxPrice, rating } = search;
  const price = Number(product.price);

  if (minPrice && price < minPrice) return false;
  if (maxPrice && price > maxPrice) return false;
  if (rating && product.rating < rating) return false;

  return true;
};

const filterProduct = (
  product: CatalogProduct,
  search: WineCatalogProps["search"],
  mode: "wines" | "bundles" = "wines"
) => {
  if (mode === "wines" && product.isBundle) return false;
  if (mode === "bundles" && !product.isBundle) return false;
  return (
    matchesText(product, search.search) &&
    matchesAttributes(product, search) &&
    matchesStats(product, search)
  );
};

function getCatalogHeading(
  shopId?: string,
  shopName?: string,
  mode: "wines" | "bundles" = "wines"
) {
  if (shopId) return `${shopName ?? "Shop"}'s Wines`;
  if (mode === "bundles") return "Explore Bundles";
  return "Explore Wines";
}

export function WineCatalog({ search, shopId, shopName, mode = "wines" }: WineCatalogProps) {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(search.search ?? "");

  const productsResult = useGetProducts();

  const shopProductsResult = useGetProducts({ shopId, isBundle: false });

  const { data: rawData, isLoading, error, refetch } = shopId ? shopProductsResult : productsResult;

  type RawProductItem = {
    color?: string;
    createdAt?: string;
    description?: string | null;
    id: string;
    isBundle?: boolean;
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

  const rawArray = Array.isArray(rawData)
    ? rawData
    : ((rawData as { data?: unknown[] })?.data ?? []);

  const products = (rawArray as RawProductItem[]).map((item) => ({
    createdAt: item.createdAt ?? "",
    description: item.description ?? null,
    id: item.id,
    isBundle: !!item.isBundle,
    name: item.name,
    price: item.price ?? "0",
    quantity: Number(item.quantity),
    rating: Number(item.rating ?? 0),
    reviewCount: Number(item.reviewCount ?? 0),
    shopId: item.shopId ?? shopId ?? "",
    shopName: item.shop?.name ?? undefined,
    updatedAt: item.updatedAt ?? null,
    wines: Array.isArray(item.wines)
      ? (item.wines as {
          id: string;
          name: string;
          region: string;
          vintageYear: string | number;
          type: string;
          color: string;
          winemaker: { id: string; name: string };
        }[])
      : [
          {
            color: item.color ?? "",
            id: item.id,
            name: item.name,
            region: item.region ?? "",
            type: item.type ?? "",
            vintageYear: Number(item.vintageYear),
            winemaker: (item.winemaker ?? { id: "", name: "" }) as { id: string; name: string },
          },
        ],
  }));

  const filteredProducts = products
    ? products
        .filter((product) => filterProduct(product, search, mode))
        .sort((a, b) => {
          switch (search.sort) {
            case "price-asc":
              return Number(a.price) - Number(b.price);
            case "price-desc":
              return Number(b.price) - Number(a.price);
            case "rating":
              return b.rating - a.rating;
            default:
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
        })
    : undefined;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (search.search ?? "")) {
        navigate({
          search: {
            ...search,
            page: 1,
            search: searchInput || undefined,
            sort: search.sort ?? "newest",
          },
          to: mode === "bundles" ? "/bundles" : "/wines",
        });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, search, navigate, mode]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div className="flex flex-col space-y-3" key={i}>
              <Skeleton className="h-[200px] w-full rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="font-bold text-destructive">Error loading products.</p>
          <Button onClick={() => refetch()} variant="link">
            Try again
          </Button>
        </div>
      );
    }

    if (!Array.isArray(filteredProducts) || filteredProducts.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center space-y-4 py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary/20">
            <SearchIcon className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold">No products found</h3>
          <p className="max-w-xs text-muted-foreground">Try adjusting or clearing your filters.</p>
          <Button
            onClick={() =>
              navigate({
                search: { page: 1, sort: "newest" },
                to: mode === "bundles" ? "/bundles" : "/wines",
              })
            }
          >
            Clear all filters
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => (
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
    <div className="container mx-auto px-6 py-8 lg:px-12">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Sidebar — desktop only */}
        <aside className="hidden w-64 flex-shrink-0 lg:block">
          <WineFiltersSidebar search={search} />
        </aside>

        {/* Main content */}
        <div className="flex-1 space-y-6">
          <h1 className="font-heading text-3xl font-bold">
            {getCatalogHeading(shopId, shopName, mode)}
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
                  navigate({
                    search: { ...search, page: 1, sort: value ?? "newest" },
                    to: mode === "bundles" ? "/bundles" : "/wines",
                  })
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
            Showing{" "}
            <span className="font-bold text-foreground">{filteredProducts?.length ?? 0}</span>{" "}
            products
          </p>

          {renderContent()}

          {/* Load more */}
          {filteredProducts && filteredProducts.length >= 12 && (
            <div className="flex justify-center pt-8">
              <Button
                className="rounded-full px-8"
                onClick={() =>
                  navigate({
                    search: {
                      ...search,
                      page: (Number(search.page) || 1) + 1,
                      sort: search.sort ?? "newest",
                    },
                    to: mode === "bundles" ? "/bundles" : "/wines",
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
  );
}
