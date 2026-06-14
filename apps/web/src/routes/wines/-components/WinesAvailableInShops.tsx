import { ErrorState } from "@/components/primitives/error-state";
import { Section } from "@/components/primitives/section";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetProducts } from "@/generated/hooks/useGetProducts";
import { DETAIL_CARD_GRID, DETAIL_CARD_ITEM } from "@/lib/detail-card-grid";
import { ProductCard } from "@/routes/-components/ProductCard";

interface WinesAvailableInShopsProps {
  wineId: string;
}

export function WinesAvailableInShops({ wineId }: WinesAvailableInShopsProps) {
  const { data: productsData, isLoading, isError, refetch } = useGetProducts({ wineId });

  if (isLoading) {
    return (
      <Section heading="Available in shops">
        <div className={DETAIL_CARD_GRID}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton className={`aspect-square rounded-2xl ${DETAIL_CARD_ITEM}`} key={i} />
          ))}
        </div>
      </Section>
    );
  }

  if (isError) {
    return (
      <Section heading="Available in shops">
        <ErrorState
          message="Couldn't load shops selling this wine."
          onRetry={() => refetch()}
          title="Failed to load"
        />
      </Section>
    );
  }

  const products = productsData?.data ?? [];

  if (products.length === 0) {
    return (
      <Section heading="Available in shops">
        <p className="italic text-muted-foreground">
          This wine is not currently available in any shops.
        </p>
      </Section>
    );
  }

  return (
    <Section heading="Available in shops">
      <div className={DETAIL_CARD_GRID}>
        {products.map((product) => (
          <div className={DETAIL_CARD_ITEM} key={product.id}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </Section>
  );
}
