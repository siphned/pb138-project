import { useGetShopsByIdProducts } from "@/generated/hooks/productsController/useGetShopsByIdProducts";
import type { GetProducts200 } from "@/generated/types/GetProducts";
import { WineCard } from "./WineCard";

interface ShopProductsSectionProps {
  shopId: string;
}

export function ShopProductsSection({ shopId }: ShopProductsSectionProps) {
  const { data: products, isLoading } = useGetShopsByIdProducts(shopId, { isBundle: "false" });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="font-heading text-2xl font-bold">Best Seller Wines</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[1, 2, 3].map((i) => (
            <div
              className="h-[300px] w-[220px] shrink-0 animate-pulse rounded-2xl bg-secondary/20"
              key={i}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="font-heading text-2xl font-bold">Best Seller Wines</h2>
        <p className="text-sm text-muted-foreground">No wines listed yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-2xl font-bold">Best Seller Wines</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {(products as GetProducts200).map((product) => (
          <div className="w-[220px] shrink-0" key={product.id}>
            <WineCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
