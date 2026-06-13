import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { BundleCard } from "@/components/catalog/BundleCard";
import { Button } from "@/components/ui/button";
import { useGetShopsByIdProducts } from "@/generated/hooks/useGetShopsByIdProducts";

// Shape returned by GET /shops/:id/products (no response schema in OpenAPI)
type ShopProductRaw = {
  id: string;
  name: string;
  price: string;
  productWines?: unknown[];
  wines?: unknown[];
};

interface ShopBundlesSectionProps {
  shopId: string;
}

export function ShopBundlesSection({ shopId }: ShopBundlesSectionProps) {
  const { data, isLoading } = useGetShopsByIdProducts(shopId, { isBundle: true });
  // BE returns { data: [...], limit, page, total } — keep a fallback for callers
  // that may receive a bare array.
  const products: ShopProductRaw[] = Array.isArray(data)
    ? (data as ShopProductRaw[])
    : ((data as { data?: ShopProductRaw[] } | undefined)?.data ?? []);

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

  if (products.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="font-heading text-2xl font-bold">Exclusive Bundles</h2>
        <p className="text-sm text-muted-foreground italic">No bundles listed yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-2xl font-bold">Exclusive Bundles</h2>
      <div className="flex gap-4 overflow-x-auto p-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {products.map((product) => (
          <div className="w-60 shrink-0" key={product.id}>
            <BundleCard key={product.id} product={product} />
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <Button variant="outline">
          <Link
            className="flex items-center gap-2 text-sm "
            search={{ isBundle: "true", page: 1, shopId: shopId, sort: "newest" }}
            to="/products"
          >
            Show Inventory
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
