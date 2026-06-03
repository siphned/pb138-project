import { FilterIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { CatalogPagination } from "@/components/catalog/CatalogPagination";
import { CatalogResults } from "@/components/catalog/CatalogResults";
import { CatalogState } from "@/components/catalog/CatalogState";
import { ProductCard } from "@/components/catalog/ProductCard";
import { asNumOrStr, asString, type ProductSearch } from "@/components/catalog/types";
import { PageHeader } from "@/components/primitives/page-header";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useGetProducts } from "@/generated/hooks/useGetProducts";
import {
  type GetProductsQueryParamsColorEnumKey,
  type GetProductsQueryParamsSortEnumKey,
  type GetProductsQueryParamsTypeEnumKey,
  getProductsQueryParamsColorEnum,
  getProductsQueryParamsSortEnum,
  getProductsQueryParamsTypeEnum,
} from "@/generated/types/GetProducts";

const COLOR_VALUES = Object.values(getProductsQueryParamsColorEnum) as readonly string[];
const isColor = (v: unknown): v is GetProductsQueryParamsColorEnumKey =>
  typeof v === "string" && COLOR_VALUES.includes(v);

const SORT_VALUES = Object.values(getProductsQueryParamsSortEnum) as readonly string[];
const isSort = (v: unknown): v is GetProductsQueryParamsSortEnumKey =>
  typeof v === "string" && SORT_VALUES.includes(v);

const TYPE_VALUES = Object.values(getProductsQueryParamsTypeEnum) as readonly string[];
const isProductType = (v: unknown): v is GetProductsQueryParamsTypeEnumKey =>
  typeof v === "string" && TYPE_VALUES.includes(v);

export const Route = createFileRoute("/products/")({
  component: ProductsPage,
  validateSearch: (raw): ProductSearch => ({
    color: isColor(raw.color) ? raw.color : undefined,
    isBundle: typeof raw.isBundle === "boolean" ? raw.isBundle : undefined,
    maxPrice: asNumOrStr(raw.maxPrice),
    minPrice: asNumOrStr(raw.minPrice),
    page: asNumOrStr(raw.page),
    q: asString(raw.q),
    rating: asNumOrStr(raw.rating),
    region: asString(raw.region),
    shopId: asString(raw.shopId),
    sort: isSort(raw.sort) ? raw.sort : undefined,
    type: isProductType(raw.type) ? raw.type : undefined,
    wineId: asString(raw.wineId),
  }),
});

function ProductsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  // shopId is a UI-only filter; the products list endpoint scopes by shop via
  // its own /shops/:id/products route, not a query param.
  const { shopId: _shopId, ...apiSearchParams } = search;
  const query = useGetProducts(apiSearchParams);

  const handleSearchChange = (next: ProductSearch) => {
    navigate({ replace: true, search: next });
  };

  const products = query.data?.data || [];
  const total = Number(query.data?.total || 0);
  const page = Number(search.page || 1);
  const limit = Number(query.data?.limit || 20);

  const handlePageChange = (newPage: number) => {
    handleSearchChange({ ...search, page: newPage });
  };

  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <PageHeader description="Browse wines available for purchase." title="Products" />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[280px_1fr]">
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger render={<Button className="w-full" size="sm" variant="outline" />}>
              <HugeiconsIcon className="mr-2 h-4 w-4" icon={FilterIcon} />
              Filters
            </SheetTrigger>
            <SheetContent className="w-[300px]" side="left">
              <div className="py-8 px-4 h-full overflow-y-auto">
                <CatalogFilters
                  entity="products"
                  onSearchChange={handleSearchChange}
                  search={search}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <aside className="hidden lg:block">
          <CatalogFilters entity="products" onSearchChange={handleSearchChange} search={search} />
        </aside>

        <main className="space-y-8">
          <CatalogState
            emptyDescription="Try adjusting your filters to find what you're looking for."
            emptyTitle="No products found"
            isEmpty={products.length === 0}
            isError={query.isError}
            isLoading={query.isLoading}
            onRetry={() => query.refetch()}
          >
            <CatalogResults
              count={total}
              rightSlot={
                <Select
                  onValueChange={(v) =>
                    handleSearchChange({
                      ...search,
                      page: 1,
                      sort: v === "default" ? undefined : (v as GetProductsQueryParamsSortEnumKey),
                    })
                  }
                  value={search.sort ?? "default"}
                >
                  <SelectTrigger
                    className="w-[180px] rounded-md bg-secondary text-secondary-foreground"
                    size="sm"
                  >
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-asc">Price: low to high</SelectItem>
                    <SelectItem value="price-desc">Price: high to low</SelectItem>
                    <SelectItem value="rating">Top rated</SelectItem>
                  </SelectContent>
                </Select>
              }
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </CatalogResults>
            <CatalogPagination
              limit={limit}
              onPageChange={handlePageChange}
              page={page}
              total={total}
            />
          </CatalogState>
        </main>
      </div>
    </div>
  );
}
