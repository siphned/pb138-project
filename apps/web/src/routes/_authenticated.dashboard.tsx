import { createFileRoute, Link } from "@tanstack/react-router";
import { useUser } from "@/context/UserContext";
import { StubPage } from "@/components/dev/StubPage";
import { StubGet } from "@/components/dev/StubGet";
import { StubMutation } from "@/components/dev/StubMutation";
import { useGetUsersMe } from "@/generated/hooks/useGetUsersMe";
import { useGetUsersMeAddresses } from "@/generated/hooks/useGetUsersMeAddresses";
import { usePostRoleRequests } from "@/generated/hooks/usePostRoleRequests";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardStub,
});

function DashboardStub() {
  const { user } = useUser();
  const roles = user?.roles ?? [];

  const userQuery = useGetUsersMe();
  const addressesQuery = useGetUsersMeAddresses();
  const roleRequestMutation = usePostRoleRequests();

  return (
    <StubPage
      title={`Dashboard (active roles: ${roles.join(", ") || "customer"})`}
      actorRole="customer+"
      hookName="useGetUsersMe + useGetUsersMeAddresses + usePostRoleRequests"
    >
      <StubGet title="My profile" actorRole="customer+" hookName="useGetUsersMe" query={userQuery} />
      <StubGet
        title="My addresses"
        actorRole="customer+"
        hookName="useGetUsersMeAddresses"
        query={addressesQuery}
      />
      <StubMutation
        title="Request new role"
        actorRole="customer+"
        hookName="usePostRoleRequests"
        mutation={roleRequestMutation}
        payloadExample={{ data: { requestedRole: "winemaker", justification: "Test request" } }}
      />
      <div className="rounded-md bg-muted p-4 text-sm space-y-1">
        <div className="font-bold">Quick links</div>
        <Link className="block text-primary hover:underline" to="/orders">My orders</Link>
        <Link className="block text-primary hover:underline" to="/stats">Full stats</Link>
        {roles.includes("winemaker") && (
          <Link
            className="block text-primary hover:underline"
            to="/explore"
            search={{ winemakerId: "me" }}
          >
            My wines
          </Link>
        )}
        {roles.includes("winemaker") && (
          <Link
            className="block text-primary hover:underline"
            to="/events"
            search={{ winemakerId: "me" }}
          >
            My events
          </Link>
        )}
        {roles.includes("shop_owner") && (
          <Link
            className="block text-primary hover:underline"
            to="/shops"
            search={{ ownerUserId: "me" }}
          >
            My shops
          </Link>
        )}
      </div>
    </StubPage>
  );
}
