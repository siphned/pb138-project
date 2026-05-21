import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, BarChart3, Loader2, ShoppingBag, Users, Wine } from "lucide-react";
import { useState } from "react";
import { EventsTab } from "@/components/dashboard/tabs/EventsTab";
import { MyBundlesTab } from "@/components/dashboard/tabs/MyBundlesTab";
import { WinesTab } from "@/components/dashboard/tabs/WinesTab";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/context/UserContext";
import { useGetStats } from "@/generated/hooks/useGetStats";
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

  const statsRole: "admin" | "winemaker" | "shop_owner" | "customer" =
    activeRole === Role.admin
      ? "admin"
      : activeRole === Role.winemaker
        ? "winemaker"
        : activeRole === Role.shopOwner
          ? "shop_owner"
          : "customer";

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
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))
        ) : statsError || !stats ? (
          <Card className="col-span-full">
            <CardContent className="flex items-center gap-2 py-4 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span>Failed to load statistics</span>
            </CardContent>
          </Card>
        ) : (
          renderStats(stats)
        )}
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

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function renderStats(stats: NonNullable<ReturnType<typeof useGetStats>["data"]>) {
  switch (stats.role) {
    case "customer": {
      const c = stats as Extract<typeof stats, { ordersCount: unknown }>;
      return (
        <>
          <StatCard icon={ShoppingBag} label="Orders" value={toNumber(c.ordersCount)} />
          <StatCard
            icon={BarChart3}
            label="Total spent"
            value={eur(toNumber(c.totalSpent as number))}
          />
          <StatCard icon={Users} label="Events attended" value={toNumber(c.eventsAttended)} />
          <StatCard icon={BarChart3} label="Reviews written" value={toNumber(c.reviewsWritten)} />
        </>
      );
    }
    case "winemaker": {
      const w = stats as Extract<typeof stats, { wineCount: unknown }>;
      const avg = w.avgReviewScore;
      return (
        <>
          <StatCard icon={Wine} label="Wines in catalog" value={toNumber(w.wineCount)} />
          <StatCard icon={BarChart3} label="Total stock" value={toNumber(w.totalStock)} />
          <StatCard
            icon={Users}
            label="Approved events"
            value={toNumber(w.eventsByStatus?.approved)}
          />
          <StatCard
            icon={BarChart3}
            label="Avg review score"
            value={avg === null ? "—" : (avg as number).toFixed(1)}
          />
        </>
      );
    }
    case "shop_owner": {
      const s = stats as Extract<typeof stats, { shopsCount: unknown }>;
      return (
        <>
          <StatCard icon={BarChart3} label="Shops" value={toNumber(s.shopsCount)} />
          <StatCard icon={Wine} label="Products" value={toNumber(s.productsByType?.standard)} />
          <StatCard
            icon={ShoppingBag}
            label="Orders processed"
            value={toNumber(s.orderItemsProcessed)}
          />
          <StatCard icon={BarChart3} label="Revenue" value={eur(toNumber(s.revenue))} />
        </>
      );
    }
    case "admin": {
      const a = stats as Extract<typeof stats, { usersByRole: unknown }>;
      return (
        <>
          <StatCard
            icon={Users}
            label="Total users"
            value={
              toNumber(a.usersByRole?.customer) +
              toNumber(a.usersByRole?.winemaker) +
              toNumber(a.usersByRole?.shop_owner) +
              toNumber(a.usersByRole?.admin)
            }
          />
          <StatCard icon={Wine} label="Total products" value={toNumber(a.totalProducts)} />
          <StatCard icon={BarChart3} label="Total revenue" value={eur(toNumber(a.totalRevenue))} />
          <StatCard
            icon={AlertTriangle}
            label="Pending requests"
            value={toNumber(a.pendingRoleRequests) + toNumber(a.pendingEvents)}
          />
        </>
      );
    }
    default:
      return null;
  }
}
