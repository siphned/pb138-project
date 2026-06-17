import { createFileRoute } from "@tanstack/react-router";
import { AdminStatsSection } from "@/components/stats/AdminStatsSection";
import { CustomerStatsSection } from "@/components/stats/CustomerStatsSection";
import { ShopOwnerStatsSection } from "@/components/stats/ShopOwnerStatsSection";
import { WinemakerStatsSection } from "@/components/stats/WinemakerStatsSection";
import { useUser } from "@/context/UserContext";
import { Role } from "@/types/roles";

export const Route = createFileRoute("/_authenticated/stats")({
  component: StatsPage,
});

function StatsPage() {
  const { user } = useUser();
  const roles = user?.roles ?? [];

  return (
    <div className="container py-8 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      {roles.includes(Role.customer) && <CustomerStatsSection />}
      {roles.includes(Role.winemaker) && <WinemakerStatsSection />}
      {roles.includes(Role.shopOwner) && <ShopOwnerStatsSection />}
      {roles.includes(Role.admin) && <AdminStatsSection />}
      {roles.length === 0 && (
        <p className="text-muted-foreground">
          No roles assigned yet. Contact an admin to get started.
        </p>
      )}
    </div>
  );
}
