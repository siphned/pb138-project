import { BundleCard } from "@/components/catalog/BundleCard";
import { useGetShopsByIdProducts } from "@/generated/hooks/useGetShopsByIdProducts";

type RawBundle = {
  id: string;
  name: string;
  price: string;
  wines?: { id: string }[];
  productWines?: { wine: { id: string } }[];
};

interface BundlesContainingWineProps {
  shopId: string;
  wineId: string;
}

export function BundlesContainingWine({ shopId, wineId }: BundlesContainingWineProps) {
  const { data, isLoading } = useGetShopsByIdProducts(shopId, { isBundle: "true" });
  const allBundles: RawBundle[] = Array.isArray(data)
    ? (data as RawBundle[])
    : ((data as { data?: RawBundle[] } | undefined)?.data ?? []);

  const bundles = allBundles.filter((b) => {
    if (Array.isArray(b.wines)) return b.wines.some((w) => w.id === wineId);
    if (Array.isArray(b.productWines)) return b.productWines.some((pw) => pw.wine?.id === wineId);
    return false;
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="font-heading text-2xl font-bold">Also Available in Bundles</h2>
        <div className="flex gap-4">
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

  if (bundles.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-2xl font-bold">Also Available in Bundles</h2>
      <div className="flex gap-4 overflow-x-auto p-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {bundles.map((b) => (
          <div className="w-60 shrink-0" key={b.id}>
            <BundleCard key={b.id} product={b} />
          </div>
        ))}
      </div>
    </div>
  );
}
