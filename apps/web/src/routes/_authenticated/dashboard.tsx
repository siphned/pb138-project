import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/primitives/section";
import { DashboardProfileCard } from "@/routes/_authenticated/-components/DashboardProfileCard";
import { DashboardQuickStats } from "@/routes/_authenticated/-components/DashboardQuickStats";
import { DashboardTabs } from "@/routes/_authenticated/-components/DashboardTabs";

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
    </div>
  );
}
