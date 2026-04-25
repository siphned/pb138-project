import { createFileRoute } from "@tanstack/react-router";
import { Calendar, DollarSign, ShoppingBag, TrendingUp, Wine } from "lucide-react";
import { useState } from "react";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { ProfileEditForm } from "@/components/dashboard/ProfileEditForm";
import { UserInfoCard } from "@/components/dashboard/UserInfoCard";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/context/UserContext";
import { Role } from "@/types/roles";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { isLoading } = useUser();
  const [currentRole, setCurrentRole] = useState<Role>(Role.winemaker);
  const [isEditing, setIsEditing] = useState(false);

  const getStatsForRole = (role: Role) => {
    switch (role) {
      case Role.customer:
        return [
          { title: "Total Orders", value: "15", icon: ShoppingBag, trend: "5 new this month" },
          { title: "Events Attended", value: "4", icon: Calendar, trend: "Next: May 12" },
        ];
      case Role.shopOwner:
        return [
          {
            title: "Total Revenue",
            value: "$12,450",
            icon: DollarSign,
            trend: "+12% vs last month",
          },
          { title: "Total Orders", value: "156", icon: ShoppingBag, trend: "24 pending" },
        ];
      default:
        return [
          { title: "My Wines", value: "24", icon: Wine, trend: "+2 this month" },
          {
            title: "Total Wine Sales",
            value: "842",
            icon: TrendingUp,
            trend: "Best seller: Merlot",
          },
          { title: "Events Participated", value: "3", icon: Calendar, trend: "Next: Jun 05" },
        ];
    }
  };

  const stats = getStatsForRole(currentRole);

  if (isLoading) {
    return (
      <div class="flex h-screen w-full items-center justify-center bg-background">
        <div class="flex flex-col items-center gap-4">
          <div class="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p class="text-muted-foreground animate-pulse font-heading">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout
      activeRole={currentRole}
      onRoleChange={(newRole) => setCurrentRole(newRole as Role)}
    >
      <div class="space-y-8 pb-12">
        {isEditing ? (
          <ProfileEditForm
            onSuccess={() => setIsEditing(false)}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <>
            <UserInfoCard onEdit={() => setIsEditing(true)} />

            <div class="grid gap-4 grid-cols-1 lg:grid-flow-col lg:auto-cols-fr">
              {stats.map((stat) => (
                <Card key={stat.title} class="border-none shadow-sm bg-secondary/20 rounded-2xl">
                  <CardHeader class="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle class="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <stat.icon class="w-4 h-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div class="text-2xl font-bold">{stat.value}</div>
                    <p class="text-xs text-muted-foreground mt-1">{stat.trend}</p>
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
