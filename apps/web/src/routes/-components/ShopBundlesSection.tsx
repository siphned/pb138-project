import { BundleCard } from "@/components/catalog/BundleCard";
import { useGetShopsByIdProducts } from "@/generated/hooks/productsController/useGetShopsByIdProducts";

interface ShopBundlesSectionProps {
  shopId: string;
}

export function ShopBundlesSection({ shopId }: ShopBundlesSectionProps) {
  const { data: products, isLoading } = useGetShopsByIdProducts(shopId, { isBundle: "true" });

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
    return null; // Hide if no bundles
  }

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-2xl font-bold">Exclusive Bundles</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {(products as { id: string; name: string; price: string; wines?: unknown[] }[]).map((product) => (
          <BundleCard
            key={product.id}
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              wineCount: product.wines?.length,
            }}
          />
        ))}
      </div>
    </div>
  );
}
