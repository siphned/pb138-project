import { createFileRoute } from "@tanstack/react-router";
import { DashboardQuickLinks } from "@/components/dashboard/DashboardQuickLinks";
import { DashboardQuickStats } from "@/components/dashboard/DashboardQuickStats";
import { DashboardRoleSection } from "@/components/dashboard/DashboardRoleSection";
import { PageHeader } from "@/components/primitives/page-header";
import { Section } from "@/components/primitives/section";
import { Card } from "@/components/ui/card";
import { useUser } from "@/context/UserContext";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useUser();

  const fullName =
    user ? `${user.fname ?? ""} ${user.lname ?? ""}`.trim() || "Your dashboard" : "Dashboard";

  return (
    <div className="container mx-auto space-y-10 px-6 py-8 lg:px-12">
      <PageHeader description={user?.email} title={fullName} />

      <Section heading="Profile">
        <Card className="p-6 text-sm text-muted-foreground" variant="section">
          Profile editing UI will arrive with WINE-73. For now, manage your account from the avatar
          menu in the sidebar.
        </Card>
      </Section>

      <Section heading="Roles">
        <DashboardRoleSection />
      </Section>

      <Section heading="Your activity">
        <DashboardQuickStats />
      </Section>

      <Section heading="Quick links">
        <DashboardQuickLinks />
      </Section>
    </div>
  );
}
