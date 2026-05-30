import { createFileRoute } from "@tanstack/react-router";
import { DashboardProfileCard } from "@/components/dashboard/DashboardProfileCard";
import { DashboardQuickStats } from "@/components/dashboard/DashboardQuickStats";
import { DashboardRoleSection } from "@/components/dashboard/DashboardRoleSection";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { Section } from "@/components/primitives/section";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="container mx-auto space-y-8 px-6 py-8 lg:px-12">
      <DashboardProfileCard />

      <Section heading="Activity">
        <DashboardQuickStats />
      </Section>

      <DashboardTabs />

      <Section heading="Roles">
        <DashboardRoleSection />
      </Section>
    </div>
  );
}
