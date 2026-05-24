import { BundleCard } from "@/components/catalog/BundleCard";
import { Section } from "@/components/primitives/section";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetShopsByIdProducts } from "@/generated/hooks/useGetShopsByIdProducts";

const CARD_GRID = "grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4";

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
      <Section heading="Also available in bundles">
        <div className={CARD_GRID}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton className="aspect-square rounded-2xl" key={i} />
          ))}
        </div>
      </Section>
    );
  }

  if (bundles.length === 0) return null;

  return (
    <Section heading="Also available in bundles">
      <div className={CARD_GRID}>
        {bundles.map((b) => (
          <BundleCard key={b.id} product={b} />
        ))}
      </div>
    </Section>
  );
}
