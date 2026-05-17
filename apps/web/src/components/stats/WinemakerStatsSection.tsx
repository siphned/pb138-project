import { DataGrid } from "@/components/primitives/data-grid";
import { LoadingState } from "@/components/primitives/loading-state";
import { Section } from "@/components/primitives/section";
import { useGetEvents } from "@/generated/hooks/useGetEvents";
import { useGetSupplyAgreementsWinemaker } from "@/generated/hooks/useGetSupplyAgreementsWinemaker";
import { useGetWines } from "@/generated/hooks/useGetWines";
import { StatTile } from "./StatTile";

const toNumber = (n: unknown): number => {
  if (typeof n === "number") return n;
  if (typeof n === "string") {
    const parsed = Number(n);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

// TODO(BE): support `winemakerId=me` server-side OR expose `useGetWinemakerMine` aggregator.
// TODO(BE): expose `useGetReviewsByWinemakerMe` (or aggregate into a stats endpoint) for Average review score.
export function WinemakerStatsSection() {
  const winesQuery = useGetWines();
  const eventsQuery = useGetEvents();
  const supplyQuery = useGetSupplyAgreementsWinemaker();

  const isLoading = winesQuery.isLoading || eventsQuery.isLoading || supplyQuery.isLoading;

  if (isLoading) {
    return (
      <Section heading="Winemaker performance">
        <LoadingState variant="catalog" />
      </Section>
    );
  }

  const wines = (winesQuery.data ?? []) as Array<{ quantity: string | number }>;
  const events = (eventsQuery.data ?? []) as Array<unknown>;
  const supply = (supplyQuery.data ?? []) as Array<unknown>;

  const winesCount = wines.length;
  const totalStock = wines.reduce((acc, w) => acc + toNumber(w.quantity), 0);
  const eventsCount = Array.isArray(events) ? events.length : 0;
  const supplyCount = Array.isArray(supply) ? supply.length : 0;

  return (
    <Section heading="Winemaker performance">
      <DataGrid variant="gallery">
        <StatTile label="Wines in catalog" value={winesCount} />
        <StatTile label="Total stock" value={totalStock} />
        <StatTile label="Events created" value={eventsCount} />
        <StatTile label="Supply agreements" value={supplyCount} />
        <StatTile hint="BE backlog" label="Average review score" value="—" />
      </DataGrid>
    </Section>
  );
}
