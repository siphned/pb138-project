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

const eur = (n: number) =>
  n.toLocaleString("en-IE", { currency: "EUR", maximumFractionDigits: 0, style: "currency" });

export function ShopOwnerStatsSection() {
  const { data, isLoading, isError, refetch } = useGetStats({ role: "shop_owner" });

  if (isLoading) {
    return (
      <Section heading="Shop performance">
        <LoadingState variant="catalog" />
      </Section>
    );
  }

  if (isError || !data || data.role !== "shop_owner") {
    return (
      <Section heading="Shop performance">
        <ErrorState
          message="We couldn't load your shop stats."
          onRetry={() => refetch()}
          title="Stats unavailable"
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
