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

export function CustomerStatsSection() {
  const { data, isLoading, isError, refetch } = useGetStats({ role: "customer" });

  if (isLoading) {
    return (
      <Section heading="My activity">
        <LoadingState variant="catalog" />
      </Section>
    );
  }

  if (isError || !data || data.role !== "customer") {
    return (
      <Section heading="My activity">
        <ErrorState
          message="We couldn't load your customer stats."
          onRetry={() => refetch()}
          title="Stats unavailable"
        />
      </Section>
    );
  }

  const customer = data as Extract<typeof data, { ordersCount: string | number }>;

  return (
    <Section heading="My activity">
      <DataGrid variant="gallery">
        <StatTile label="Orders" value={toNumber(customer.ordersCount)} />
        <StatTile label="Total spent" value={eur(toNumber(customer.totalSpent))} />
        <StatTile label="Events attended" value={toNumber(customer.eventsAttended)} />
        <StatTile label="Reviews written" value={toNumber(customer.reviewsWritten)} />
      </DataGrid>
    </Section>
  );
}
