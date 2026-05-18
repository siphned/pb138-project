import { DataGrid } from "@/components/primitives/data-grid";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { Section } from "@/components/primitives/section";
import { useGetStats } from "@/generated/hooks/useGetStats";
import { StatTile } from "./StatTile";

const toNumber = (n: unknown): number => {
  if (typeof n === "number") return n;
  if (typeof n === "string") {
    const parsed = Number(n);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

export function WinemakerStatsSection() {
  const { data, isLoading, isError, refetch } = useGetStats({ role: "winemaker" });

  if (isLoading) {
    return (
      <Section heading="Winemaker performance">
        <LoadingState variant="catalog" />
      </Section>
    );
  }

  if (isError || !data || data.role !== "winemaker") {
    return (
      <Section heading="Winemaker performance">
        <ErrorState
          message="We couldn't load your winemaker stats."
          onRetry={() => refetch()}
          title="Stats unavailable"
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
        <StatTile label="Approved events" value={eventsApproved} />
        <StatTile label="Approved supply agreements" value={supplyApproved} />
        <StatTile
          label="Average review score"
          value={avgScore === null ? "—" : avgScore.toFixed(1)}
        />
      </DataGrid>
    </Section>
  );
}
