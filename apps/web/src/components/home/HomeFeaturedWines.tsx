import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { WineCard } from "@/components/catalog/WineCard";
import { DataGrid } from "@/components/primitives/data-grid";
import { LoadingState } from "@/components/primitives/loading-state";
import { Section } from "@/components/primitives/section";
import { Button } from "@/components/ui/button";
import { useGetWines } from "@/generated/hooks/useGetWines";

export function HomeFeaturedWines() {
  const { data, isLoading } = useGetWines();

  if (isLoading) return <LoadingState variant="catalog" />;

  const wines = (data ?? []).slice(0, 3);
  if (wines.length === 0) return null;

  return (
    <Section
      actions={
        <Button render={<Link to="/wines" />} size="sm" variant="outline">
          View all
          <HugeiconsIcon className="ml-2 h-3.5 w-3.5" icon={ArrowRight01Icon} />
        </Button>
      }
      heading="Featured wines"
    >
      <DataGrid variant="catalog">
        {wines.map((wine) => (
          <WineCard key={wine.id} wine={wine} />
        ))}
      </DataGrid>
    </Section>
  );
}
