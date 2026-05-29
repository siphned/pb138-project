import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/context/UserContext";
import { useGetStats } from "@/generated/hooks/useGetStats";
import type { GetStatsQueryParamsRoleEnumKey } from "@/generated/types/GetStats";

const ROLE_TO_BE: Record<string, GetStatsQueryParamsRoleEnumKey> = {
  Admin: "admin",
  Customer: "customer",
  "Shop Owner": "shop_owner",
  Winemaker: "winemaker",
};

interface StatTile {
  label: string;
  value: string;
}

function asNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const parsed = Number.parseFloat(v);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-IE", {
    currency: "EUR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(n);
}

// biome-ignore lint/suspicious/noExplicitAny: GetStats200 is a discriminated union by `role` and the BE shape varies; narrow via `role` field here
function tilesFor(stats: any): StatTile[] {
  if (!stats || typeof stats !== "object") return [];
  switch (stats.role) {
    case "customer":
      return [
        { label: "Orders placed", value: String(asNumber(stats.ordersCount)) },
        { label: "Total spent", value: formatCurrency(asNumber(stats.totalSpent)) },
        { label: "Reviews written", value: String(asNumber(stats.reviewsWritten)) },
        { label: "Events attended", value: String(asNumber(stats.eventsAttended)) },
      ];
    case "winemaker":
      return [
        { label: "Wines published", value: String(asNumber(stats.wineCount)) },
        { label: "Total stock", value: String(asNumber(stats.totalStock)) },
        {
          label: "Avg review score",
          value:
            stats.avgReviewScore !== null && stats.avgReviewScore !== undefined
              ? asNumber(stats.avgReviewScore).toFixed(1)
              : "—",
        },
        { label: "Approved events", value: String(asNumber(stats.eventsByStatus?.approved)) },
      ];
    case "shop_owner":
      return [
        { label: "Shops managed", value: String(asNumber(stats.shopsCount)) },
        { label: "Revenue", value: formatCurrency(asNumber(stats.revenue)) },
        { label: "Stock value", value: formatCurrency(asNumber(stats.totalStockValue)) },
        {
          label: "Items processed",
          value: String(asNumber(stats.orderItemsProcessed)),
        },
      ];
    case "admin":
      return [
        { label: "Pending role requests", value: String(asNumber(stats.pendingRoleRequests)) },
        { label: "Pending events", value: String(asNumber(stats.pendingEvents)) },
        { label: "Total events", value: String(asNumber(stats.totalEvents)) },
        { label: "Total products", value: String(asNumber(stats.totalProducts)) },
      ];
    default:
      return [];
  }
}

export function DashboardQuickStats() {
  const { user, activeRole } = useUser();
  const role = activeRole ? ROLE_TO_BE[activeRole] : undefined;

  const { data: stats, isLoading } = useGetStats(
    { role: role ?? "customer" },
    { query: { enabled: !!user && !!role } }
  );

  if (!user) return null;

  const tiles = tilesFor(stats);

  return (
    <div className="space-y-4" data-slot="dashboard-quick-stats">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? [1, 2, 3, 4].map((i) => <Skeleton className="h-24 rounded-2xl" key={i} />)
          : tiles.map((tile) => (
              <Card className="flex flex-col gap-2 p-5" key={tile.label}>
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {tile.label}
                </span>
                <span className="font-heading text-3xl font-bold text-foreground">
                  {tile.value}
                </span>
              </Card>
            ))}
      </div>

      {tiles.length > 0 && (
        <div className="flex justify-end">
          <Button render={<Link to="/stats" />} size="sm" variant="outline">
            View full stats
            <HugeiconsIcon className="ml-2 h-3.5 w-3.5" icon={ArrowRight01Icon} />
          </Button>
        </div>
      )}
    </div>
  );
}
