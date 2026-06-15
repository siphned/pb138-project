import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { DataGrid } from "@/components/primitives/data-grid";
import { LoadingState } from "@/components/primitives/loading-state";
import { Section } from "@/components/primitives/section";
import { Button } from "@/components/ui/button";
import { useGetWinemakers } from "@/generated/hooks/useGetWinemakers";
import { WinemakerCard } from "@/routes/-components/WinemakerCard";

export function HomeFeaturedWinemakers() {
  const { data, isLoading } = useGetWinemakers();

  if (isLoading) return <LoadingState variant="catalog" />;

  const winemakers = (data?.data ?? []).slice(0, 3);
  if (winemakers.length === 0) return null;

  return (
    <Section
      actions={
        <Button render={<Link to="/winemakers" />} size="sm" variant="outline">
          View all
          <HugeiconsIcon className="ml-2 h-3.5 w-3.5" icon={ArrowRight01Icon} />
        </Button>
      }
      heading="Featured winemakers"
    >
      <DataGrid variant="catalog">
        {winemakers.map((winemaker) => (
          <WinemakerCard key={winemaker.id} winemaker={winemaker} />
        ))}
      </DataGrid>
    </Section>
  );
}
