import { ErrorState } from "@/components/primitives/error-state";
import { Section } from "@/components/primitives/section";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetProducts } from "@/generated/hooks/useGetProducts";

interface WinesAvailableInShopsProps {
  wineId: string;
}

export function WinesAvailableInShops({ wineId }: WinesAvailableInShopsProps) {
  const { data: productsData, isLoading, isError, refetch } = useGetProducts({ wineId });

  if (isLoading) {
    return (
      <Section heading="Available in shops">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton className="aspect-square rounded-2xl" key={i} />
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
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </Section>
  );
}
