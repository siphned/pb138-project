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

const TILE_COUNT = 6;

export function ShopOwnerStatsSection() {
  const { data, isLoading, isError, error, refetch } = useGetStats({ role: "shop_owner" });

  if (isLoading) {
    return (
      <Section heading="Shop performance">
        <StatTilesSkeleton count={TILE_COUNT} />
      </Section>
    );
  }

  if (isError || !data || data.role !== "shop_owner") {
    return (
      <Section heading="Shop performance">
        <StatsErrorState
          isForbidden={is403(error)}
          onRetry={() => refetch()}
          roleLabel="shop owner"
        />
      </Section>
    );
  }

  const owner = data as Extract<typeof data, { shopsCount: string | number }>;

  return (
    <Section heading="Shop performance">
      <DataGrid variant="gallery">
        <StatTile label="Shops" value={toNumber(owner.shopsCount)} />
        <StatTile label="Products" value={toNumber(owner.productsByType?.standard)} />
        <StatTile label="Bundles" value={toNumber(owner.productsByType?.bundles)} />
        <StatTile label="Total stock value" value={eur(toNumber(owner.totalStockValue))} />
        <StatTile label="Orders processed" value={toNumber(owner.orderItemsProcessed)} />
        <StatTile label="Revenue" value={eur(toNumber(owner.revenue))} />
      </DataGrid>
    </Section>
  );
}
