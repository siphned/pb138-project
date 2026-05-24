<<<<<<< HEAD
import { createFileRoute, Link } from "@tanstack/react-router";
import { StubGet } from "@/components/dev/StubGet";
import { StubMutation } from "@/components/dev/StubMutation";
import { StubPage } from "@/components/dev/StubPage";
import { useUser } from "@/context/UserContext";
import { useGetUsersMe } from "@/generated/hooks/useGetUsersMe";
import { useGetUsersMeAddresses } from "@/generated/hooks/useGetUsersMeAddresses";
import { usePostRoleRequests } from "@/generated/hooks/usePostRoleRequests";
import { Role } from "@/types/roles";

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
      actorRole="customer+"
      hookName="useGetUsersMe + useGetUsersMeAddresses + usePostRoleRequests"
      title={`Dashboard (active roles: ${roles.join(", ") || "customer"})`}
    >
      <StubGet
        actorRole="customer+"
        hookName="useGetUsersMe"
        query={userQuery}
        title="My profile"
      />
      <StubGet
        actorRole="customer+"
        hookName="useGetUsersMeAddresses"
        query={addressesQuery}
        title="My addresses"
      />
      <StubMutation
        actorRole="customer+"
        hookName="usePostRoleRequests"
        mutation={roleRequestMutation}
        payloadExample={{
          data: { businessName: "My Business", details: "Test request", type: "winemaker" },
        }}
        title="Request new role"
      />
      <div className="rounded-md bg-muted p-4 text-sm space-y-1">
        <div className="font-bold">Quick links</div>
        <Link className="block text-primary hover:underline" to="/orders">
          My orders
        </Link>
        <Link className="block text-primary hover:underline" to="/stats">
          Full stats
        </Link>
        {roles.includes(Role.winemaker) && (
          <Link
            className="block text-primary hover:underline"
            search={{ winemakerId: "me" }}
            to="/wines"
          >
            My wines
          </Link>
        )}
        {roles.includes(Role.winemaker) && (
          <Link
            className="block text-primary hover:underline"
            search={{ winemakerName: "me" }}
            to="/events"
          >
            My events
          </Link>
        )}
        {roles.includes(Role.shopOwner) && (
          <Link className="block text-primary hover:underline" to="/shops">
            My shops
          </Link>
        )}
        {/* dropped `?ownerUserId=me` on /shops because ShopSearch only validates `q` */}
      </div>
    </StubPage>
  );
}
