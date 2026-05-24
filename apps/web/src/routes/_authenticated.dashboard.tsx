<<<<<<< HEAD
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircleIcon,
  BarChartIcon,
  DrinkIcon,
  ShoppingBag01Icon,
  UserGroupIcon,
} from "hugeicons-react";
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
=======
import { createFileRoute } from "@tanstack/react-router";
import { Calendar, DollarSign, ShoppingBag, TrendingUp, Wine } from "lucide-react";
import { useState } from "react";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { ProfileEditForm } from "@/components/dashboard/ProfileEditForm";
import { UserInfoCard } from "@/components/dashboard/UserInfoCard";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/context/UserContext";
import { useRoles } from "@/hooks/useRoles";
>>>>>>> origin/main
import { Role } from "@/types/roles";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

<<<<<<< HEAD
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
              <AlertCircleIcon className="h-5 w-5" />
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
        icon={AlertCircleIcon}
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
=======
function appRoleToDisplayRole(appRoles: ReturnType<typeof useRoles>): Role {
  if (appRoles.includes("winemaker")) return Role.winemaker;
  if (appRoles.includes("shop_owner")) return Role.shopOwner;
  return Role.customer;
}

function availableRoles(appRoles: ReturnType<typeof useRoles>): Role[] {
  const roles: Role[] = [];
  if (appRoles.includes("winemaker") || appRoles.includes("admin")) roles.push(Role.winemaker);
  if (appRoles.includes("shop_owner") || appRoles.includes("admin")) roles.push(Role.shopOwner);
  roles.push(Role.customer);
  return roles;
}

function DashboardPage() {
  const { isLoading } = useUser();
  const appRoles = useRoles();
  const [currentRole, setCurrentRole] = useState<Role>(() => appRoleToDisplayRole(appRoles));
  const [isEditing, setIsEditing] = useState(false);

  const allowedRoles = availableRoles(appRoles);

  const getStatsForRole = (role: Role) => {
    switch (role) {
      case Role.customer:
        return [
          { icon: ShoppingBag, title: "Total Orders", trend: "5 new this month", value: "15" },
          { icon: Calendar, title: "Events Attended", trend: "Next: May 12", value: "4" },
        ];
      case Role.shopOwner:
        return [
          {
            icon: DollarSign,
            title: "Total Revenue",
            trend: "+12% vs last month",
            value: "$12,450",
          },
          { icon: ShoppingBag, title: "Total Orders", trend: "24 pending", value: "156" },
        ];
      default:
        return [
          { icon: Wine, title: "My Wines", trend: "+2 this month", value: "24" },
          {
            icon: TrendingUp,
            title: "Total Wine Sales",
            trend: "Best seller: Merlot",
            value: "842",
          },
          { icon: Calendar, title: "Events Participated", trend: "Next: Jun 05", value: "3" },
        ];
    }
  };

  const stats = getStatsForRole(currentRole);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground animate-pulse font-heading">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout
      activeRole={currentRole}
      onRoleChange={(newRole) => {
        if (allowedRoles.includes(newRole)) setCurrentRole(newRole);
      }}
    >
      <div className="space-y-8 pb-12">
        {isEditing ? (
          <ProfileEditForm
            onCancel={() => setIsEditing(false)}
            onSuccess={() => setIsEditing(false)}
          />
        ) : (
          <>
            <UserInfoCard onEdit={() => setIsEditing(true)} />

            <div className="grid gap-4 grid-cols-1 lg:grid-flow-col lg:auto-cols-fr">
              {stats.map((stat) => (
                <Card
                  className="border-none shadow-sm bg-secondary/20 rounded-2xl"
                  key={stat.title}
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className="w-4 h-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <DashboardTabs role={currentRole} />
          </>
        )}
      </div>
    </AuthLayout>
  );
}
>>>>>>> origin/main
