import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { BundleCard } from "@/components/catalog/BundleCard";
import { Button } from "@/components/ui/button";
import { useGetShopsByIdProducts } from "@/generated/hooks/productsController/useGetShopsByIdProducts";

// Shape returned by GET /shops/:id/products (no response schema in OpenAPI)
type ShopProductRaw = {
  id: string;
  name: string;
  price: string;
  productWines: unknown[];
};

interface ShopBundlesSectionProps {
  shopId: string;
}

export function ShopBundlesSection({ shopId }: ShopBundlesSectionProps) {
  const { data, isLoading } = useGetShopsByIdProducts(shopId, { isBundle: "true" });
  const products = data as ShopProductRaw[] | undefined;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="font-heading text-2xl font-bold">Exclusive Bundles</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[1, 2, 3].map((i) => (
            <div
              className="h-[280px] w-[200px] shrink-0 animate-pulse rounded-2xl bg-secondary/20"
              key={i}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-2xl font-bold">Exclusive Bundles</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.map((product) => (
          <BundleCard
            key={product.id}
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              wineCount: product.productWines.length,
            }}
          />
        ))}
      </div>
      <div className="flex justify-center">
        <Button variant="outline">
          <Link 
            className="flex items-center gap-2 text-sm " 
            search={{ page: 1, sort: "newest" }}
            to="/wines"
          >
            Show Inventory
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
