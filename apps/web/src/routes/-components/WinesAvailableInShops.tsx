import { Skeleton } from "@/components/ui/skeleton";
import { useGetProducts } from "@/generated/hooks/useGetProducts";
import { ProductPriceRow } from "./ProductPriceRow";
import { ProductSoldAtCard } from "./ProductSoldAtCard";

interface WinesAvailableInShopsProps {
  wineId: string;
}

export function WinesAvailableInShops({ wineId }: WinesAvailableInShopsProps) {
  const { data: productsData, isLoading, isError } = useGetProducts({ wineId });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="font-heading text-xl font-bold">Available in shops</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !productsData || productsData.data.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="font-heading text-xl font-bold">Available in shops</h3>
        <p className="text-muted-foreground italic">
          This wine is not currently available in any shops.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="font-heading text-xl font-bold">Available in shops</h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {productsData.data.map((product) => (
          <div className="space-y-4 rounded-2xl border bg-card p-6 shadow-xs" key={product.id}>
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-heading text-lg font-bold">{product.name}</h4>
                <div className="mt-2">
                  <ProductSoldAtCard shopId={product.shop.id} shopName={product.shop.name} />
                </div>
              </div>
            </div>
            <ProductPriceRow
              price={product.price}
              productId={product.id}
              quantity={Number(product.quantity)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
