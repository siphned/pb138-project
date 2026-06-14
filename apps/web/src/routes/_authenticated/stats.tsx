import { createFileRoute } from "@tanstack/react-router";
import { EmptyState } from "@/components/primitives/empty-state";
import { PageHeader } from "@/components/primitives/page-header";
import { useUser } from "@/context/UserContext";
import { AdminStatsSection } from "@/routes/_authenticated/-components/AdminStatsSection";
import { CustomerStatsSection } from "@/routes/_authenticated/-components/CustomerStatsSection";
import { ShopOwnerStatsSection } from "@/routes/_authenticated/-components/ShopOwnerStatsSection";
import { WinemakerStatsSection } from "@/routes/_authenticated/-components/WinemakerStatsSection";
import { Role } from "@/types/roles";

export const Route = createFileRoute("/_authenticated/stats")({
  component: StatsPage,
});

function StatsPage() {
  const { activeRole, user } = useUser();

  if (!user) {
    return (
      <div className="container mx-auto space-y-8 py-8">
        <PageHeader title="Statistics" />
        <EmptyState
          description="Sign in and pick an active role to see your stats."
          title="Sign in to see your stats"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 py-8">
      <PageHeader description={`Showing metrics for your ${activeRole} role.`} title="Statistics" />
      {activeRole === Role.customer && <CustomerStatsSection />}
      {activeRole === Role.winemaker && <WinemakerStatsSection />}
      {activeRole === Role.shopOwner && <ShopOwnerStatsSection />}
      {activeRole === Role.admin && <AdminStatsSection />}
    </div>
  );
}
