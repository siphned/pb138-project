import {
  Alert02Icon,
  BarChartIcon,
  DrinkIcon,
  ShoppingBag01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { EventsTab } from "@/components/dashboard/tabs/EventsTab";
import { MyBundlesTab } from "@/components/dashboard/tabs/MyBundlesTab";
import { WinesTab } from "@/components/dashboard/tabs/WinesTab";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/context/UserContext";
import { useGetStats } from "@/generated/hooks/useGetStats";
import type { GetStatsQueryResponse } from "@/generated/types/GetStats";
import { Role } from "@/types/roles";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

const toNumber = (n: unknown): number => {
  if (typeof n === "number") return n;
  if (typeof n === "string") {
    const parsed = Number(n);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const eur = (n: number) =>
  n.toLocaleString("en-IE", {
    currency: "EUR",
    maximumFractionDigits: 0,
    style: "currency",
  });

function DashboardPage() {
  const { user, activeRole } = useUser();
  const roles = user?.roles ?? [];
  const displayRole = activeRole || Role.customer;

  const roleMap: Record<string, "admin" | "winemaker" | "shop_owner" | "customer"> = {
    [Role.admin]: "admin",
    [Role.winemaker]: "winemaker",
    [Role.shopOwner]: "shop_owner",
  };
  const statsRole: "admin" | "winemaker" | "shop_owner" | "customer" =
    (activeRole && roleMap[activeRole]) || "customer";

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
  } = useGetStats({ role: statsRole });

  const [activeTab, setActiveTab] = useState("wines");
  const showBundlesTab = roles.some((r) => r === Role.winemaker || r === Role.shopOwner);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          Dashboard
          {activeRole && (
            <Badge className="ml-3 align-middle" variant="secondary">
              {activeRole}
            </Badge>
          )}
        </h2>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {statsLoading &&
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        {(statsError || !stats) && (
          <Card className="col-span-full">
            <CardContent className="flex items-center gap-2 py-4 text-destructive">
              <HugeiconsIcon className="h-5 w-5" icon={Alert02Icon} />
              <span>Failed to load statistics</span>
            </CardContent>
          </Card>
        )}
        {!statsLoading && !statsError && stats && renderStats(stats)}
      </div>

      {/* Tabs */}
      <Tabs onValueChange={setActiveTab} value={activeTab}>
        <TabsList>
          <TabsTrigger value="wines">Wines</TabsTrigger>
          {showBundlesTab && <TabsTrigger value="bundles">My Bundles</TabsTrigger>}
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>
        <TabsContent className="mt-4" value="wines">
          <WinesTab role={displayRole} />
        </TabsContent>
        {showBundlesTab && (
          <TabsContent className="mt-4" value="bundles">
            <MyBundlesTab role={displayRole} />
          </TabsContent>
        )}
        <TabsContent className="mt-4" value="events">
          <EventsTab role={displayRole} />
        </TabsContent>
      </Tabs>

      {/* Quick Links */}
      <div className="rounded-md bg-muted p-4 text-sm space-y-1">
        <div className="font-bold">Quick links</div>
        <Link className="block text-primary hover:underline" to="/orders">
          My orders
        </Link>
        <Link className="block text-primary hover:underline" to="/stats">
          Full stats
        </Link>
        {roles.includes(Role.winemaker) && (
          <>
            <Link
              className="block text-primary hover:underline"
              search={{ winemakerId: "me" }}
              to="/explore"
            >
              My wines
            </Link>
            <Link
              className="block text-primary hover:underline"
              search={{ winemakerName: "me" }}
              to="/events"
            >
              My events
            </Link>
          </>
        )}
        {roles.includes(Role.shopOwner) && (
          <Link className="block text-primary hover:underline" to="/shops">
            My shops
          </Link>
        )}
      </div>
    </div>
  );
}

type IconSvgObject = readonly (readonly [string, Readonly<Record<string, string | number>>])[];

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: IconSvgObject;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <HugeiconsIcon className="h-4 w-4 text-muted-foreground" icon={icon} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

type CustomerStats = Extract<GetStatsQueryResponse, { ordersCount: unknown }>;
type WinemakerStats = Extract<GetStatsQueryResponse, { wineCount: unknown }>;
type ShopOwnerStats = Extract<GetStatsQueryResponse, { shopsCount: unknown }>;
type AdminStats = Extract<GetStatsQueryResponse, { usersByRole: unknown }>;

function renderCustomerStats(stats: CustomerStats) {
  return (
    <>
      <StatCard icon={ShoppingBag01Icon} label="Orders" value={toNumber(stats.ordersCount)} />
      <StatCard
        icon={BarChartIcon}
        label="Total spent"
        value={eur(toNumber(stats.totalSpent as number))}
      />
      <StatCard
        icon={UserGroupIcon}
        label="Events attended"
        value={toNumber(stats.eventsAttended)}
      />
      <StatCard
        icon={BarChartIcon}
        label="Reviews written"
        value={toNumber(stats.reviewsWritten)}
      />
    </>
  );
}

function renderWinemakerStats(stats: WinemakerStats) {
  const avg = stats.avgReviewScore;
  return (
    <>
      <StatCard icon={DrinkIcon} label="Wines in catalog" value={toNumber(stats.wineCount)} />
      <StatCard icon={BarChartIcon} label="Total stock" value={toNumber(stats.totalStock)} />
      <StatCard
        icon={UserGroupIcon}
        label="Approved events"
        value={toNumber(stats.eventsByStatus?.approved)}
      />
      <StatCard
        icon={BarChartIcon}
        label="Avg review score"
        value={avg === null ? "—" : (avg as number).toFixed(1)}
      />
    </>
  );
}

function renderShopOwnerStats(stats: ShopOwnerStats) {
  return (
    <>
      <StatCard icon={BarChartIcon} label="Shops" value={toNumber(stats.shopsCount)} />
      <StatCard
        icon={DrinkIcon}
        label="Products"
        value={toNumber(stats.productsByType?.standard)}
      />
      <StatCard
        icon={ShoppingBag01Icon}
        label="Orders processed"
        value={toNumber(stats.orderItemsProcessed)}
      />
      <StatCard icon={BarChartIcon} label="Revenue" value={eur(toNumber(stats.revenue))} />
    </>
  );
}

function renderAdminStats(stats: AdminStats) {
  return (
    <>
      <StatCard
        icon={UserGroupIcon}
        label="Total users"
        value={
          toNumber(stats.usersByRole?.customer) +
          toNumber(stats.usersByRole?.winemaker) +
          toNumber(stats.usersByRole?.shop_owner) +
          toNumber(stats.usersByRole?.admin)
        }
      />
      <StatCard icon={DrinkIcon} label="Total products" value={toNumber(stats.totalProducts)} />
      <StatCard
        icon={BarChartIcon}
        label="Total revenue"
        value={eur(toNumber(stats.totalRevenue))}
      />
      <StatCard
        icon={Alert02Icon}
        label="Pending requests"
        value={toNumber(stats.pendingRoleRequests) + toNumber(stats.pendingEvents)}
      />
    </>
  );
}

function renderStats(stats: GetStatsQueryResponse) {
  switch (stats.role) {
    case "customer":
      return renderCustomerStats(stats as CustomerStats);
    case "winemaker":
      return renderWinemakerStats(stats as WinemakerStats);
    case "shop_owner":
      return renderShopOwnerStats(stats as ShopOwnerStats);
    case "admin":
      return renderAdminStats(stats as AdminStats);
    default:
      return null;
  }
}
