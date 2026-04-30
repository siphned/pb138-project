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
import { Role } from "@/types/roles";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

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
