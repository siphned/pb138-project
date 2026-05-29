import { createFileRoute } from "@tanstack/react-router";
import { DashboardQuickLinks } from "@/components/dashboard/DashboardQuickLinks";
import { DashboardQuickStats } from "@/components/dashboard/DashboardQuickStats";
import { DashboardRoleSection } from "@/components/dashboard/DashboardRoleSection";
import { ProfileEditForm } from "@/components/dashboard/ProfileEditForm";
import { PageHeader } from "@/components/primitives/page-header";
import { Section } from "@/components/primitives/section";
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

      <Section heading="Your activity">
        <DashboardQuickStats />
      </Section>

      <Section heading="Profile">
        <ProfileEditForm />
      </Section>

      <Section heading="Roles">
        <DashboardRoleSection />
      </Section>

      <Section heading="Quick links">
        <DashboardQuickLinks />
      </Section>
    </div>
  );
}
