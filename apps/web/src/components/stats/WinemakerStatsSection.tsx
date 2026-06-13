import { DataGrid } from "@/components/primitives/data-grid";
import { Section } from "@/components/primitives/section";
import { useGetStats } from "@/generated/hooks/useGetStats";
import { is403, StatsErrorState, StatTilesSkeleton } from "./StatsSectionScaffold";
import { StatTile } from "./StatTile";

const toNumber = (n: unknown): number => {
  if (typeof n === "number") return n;
  if (typeof n === "string") {
    const parsed = Number(n);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const TILE_COUNT = 5;

export function WinemakerStatsSection() {
  const { data, isLoading, isError, error, refetch } = useGetStats({ role: "winemaker" });

  if (isLoading) {
    return (
      <Section heading="Winemaker performance">
        <StatTilesSkeleton count={TILE_COUNT} />
      </Section>
    );
  }

  if (isError || !data || data.role !== "winemaker") {
    return (
      <Section heading="Winemaker performance">
        <StatsErrorState
          isForbidden={is403(error)}
          onRetry={() => refetch()}
          roleLabel="winemaker"
        />
      </Section>
    );
  }

  const winemaker = data as Extract<typeof data, { wineCount: string | number }>;
  const avgScore = winemaker.avgReviewScore;
  const eventsApproved = toNumber(winemaker.eventsByStatus?.approved);
  const supplyApproved = toNumber(winemaker.supplyAgreementsByStatus?.approved);

  return (
    <Section heading="Winemaker performance">
      <DataGrid variant="gallery">
        <StatTile label="Wines in catalog" value={toNumber(winemaker.wineCount)} />
        <StatTile label="Total stock" value={toNumber(winemaker.totalStock)} />
        <StatTile label="My events" value={eventsApproved} />
        <StatTile label="Approved supply agreements" value={supplyApproved} />
        <StatTile
          label="Average review score"
          value={avgScore === null ? "—" : avgScore.toFixed(1)}
        />
      </DataGrid>
    </Section>
  );
}
