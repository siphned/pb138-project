import { DataGrid } from "@/components/primitives/data-grid";
import { Section } from "@/components/primitives/section";
import { useGetStats } from "@/generated/hooks/useGetStats";
import { formatEur } from "@/lib/utils";
import {
  is403,
  StatsErrorState,
  StatTilesSkeleton,
} from "@/routes/_authenticated/-components/StatsSectionScaffold";
import { StatTile } from "@/routes/_authenticated/-components/StatTile";

const toNumber = (n: unknown): number => {
  if (typeof n === "number") return n;
  if (typeof n === "string") {
    const parsed = Number(n);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const eur = (n: number) => formatEur(n, { decimals: 0 });

const TILE_COUNT = 7;

export function AdminStatsSection() {
  const { data, isLoading, isError, error, refetch } = useGetStats({ role: "admin" });

  if (isLoading) {
    return (
      <Section heading="Platform overview">
        <StatTilesSkeleton count={TILE_COUNT} />
      </Section>
    );
  }

  if (isError || !data || data.role !== "admin") {
    return (
      <Section heading="Platform overview">
        <StatsErrorState isForbidden={is403(error)} onRetry={() => refetch()} roleLabel="admin" />
      </Section>
    );
  }

  const admin = data as Extract<typeof data, { usersByRole: object }>;
  const totalUsers = Object.values(admin.usersByRole ?? {}).reduce<number>(
    (acc, n) => acc + toNumber(n),
    0
  );

  return (
    <Section heading="Platform overview">
      <DataGrid variant="gallery">
        <StatTile label="Users (total)" value={totalUsers} />
        <StatTile label="Pending role requests" value={toNumber(admin.pendingRoleRequests)} />
        <StatTile label="Deleted reviews" value={toNumber(admin.deletedReviews)} />
        <StatTile label="Total products" value={toNumber(admin.totalProducts)} />
        <StatTile label="Total shops" value={toNumber(admin.totalShops)} />
        <StatTile label="Total winemakers" value={toNumber(admin.totalWinemakers)} />
        <StatTile label="Total revenue" value={eur(toNumber(admin.totalRevenue))} />
      </DataGrid>
    </Section>
  );
}
