import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ErrorState } from "@/components/primitives/error-state";
import { LoadingState } from "@/components/primitives/loading-state";
import { PageHeader } from "@/components/primitives/page-header";
import { Section } from "@/components/primitives/section";
import { Card, CardContent } from "@/components/ui/card";
import { useGetUsersMeAddresses } from "@/generated/hooks/useGetUsersMeAddresses";
import { ClerkNameForm } from "@/routes/_authenticated/-components/ClerkNameForm";
import { DashboardRoleSection } from "@/routes/_authenticated/-components/DashboardRoleSection";
import { PasswordChangeForm } from "@/routes/_authenticated/-components/PasswordChangeForm";
import { SettingsAddressForm } from "@/routes/_authenticated/-components/SettingsAddressForm";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { data: addresses, isLoading, isError, refetch } = useGetUsersMeAddresses();

  const renderAddresses = () => {
    if (isLoading) return <LoadingState variant="detail" />;
    if (isError || !addresses) {
      return (
        <ErrorState
          message="We couldn't load your saved addresses."
          onRetry={() => refetch()}
          title="Could not load addresses"
        />
      );
    }
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="section">
          <CardContent className="space-y-4 pt-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Shipping address
            </h3>
            <SettingsAddressForm defaultValues={addresses.shipping ?? {}} type="shipping" />
          </CardContent>
        </Card>
        <Card variant="section">
          <CardContent className="space-y-4 pt-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Billing address
            </h3>
            <SettingsAddressForm defaultValues={addresses.billing ?? {}} type="billing" />
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="container mx-auto space-y-10 px-6 py-8 lg:px-12">
      <Link
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        to="/dashboard"
      >
        <HugeiconsIcon className="h-4 w-4" icon={ArrowLeft02Icon} />
        Back to dashboard
      </Link>

      <PageHeader
        description="Manage your name, password, roles, and saved addresses."
        title="Settings"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Section className="flex flex-col" heading="Your name">
          <ClerkNameForm />
        </Section>

        <Section className="flex flex-col" heading="Password">
          <PasswordChangeForm />
        </Section>
      </div>

      <Section heading="Roles">
        <DashboardRoleSection />
      </Section>

      <Section heading="Default addresses">{renderAddresses()}</Section>
    </div>
  );
}
