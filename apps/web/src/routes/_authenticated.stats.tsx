import { createFileRoute } from "@tanstack/react-router";
import { useUser } from "@/context/UserContext";
import { StubPage } from "@/components/dev/StubPage";
import { StubGet } from "@/components/dev/StubGet";
import { useGetUsersMe } from "@/generated/hooks/useGetUsersMe";
import { useGetWines } from "@/generated/hooks/useGetWines";
import { useGetEvents } from "@/generated/hooks/useGetEvents";
import { useGetShops } from "@/generated/hooks/useGetShops";
import { useGetSupplyAgreementsWinemaker } from "@/generated/hooks/useGetSupplyAgreementsWinemaker";
import { useGetAdminUsers } from "@/generated/hooks/useGetAdminUsers";
import { useGetRoleRequests } from "@/generated/hooks/useGetRoleRequests";
import { useGetAdminEvents } from "@/generated/hooks/useGetAdminEvents";
import { useGetAdminReviews } from "@/generated/hooks/useGetAdminReviews";

export const Route = createFileRoute("/_authenticated/stats")({
  component: StatsStub,
});

function StatsStub() {
  const { user } = useUser();
  const roles = user?.roles ?? [];

  const userQuery = useGetUsersMe();
  const myWinesQuery = useGetWines();
  const myEventsQuery = useGetEvents();
  const myShopsQuery = useGetShops();
  const supplyQuery = useGetSupplyAgreementsWinemaker();
  const adminUsersQuery = useGetAdminUsers();
  const adminRoleReqQuery = useGetRoleRequests();
  const adminEventsQuery = useGetAdminEvents();
  const adminReviewsQuery = useGetAdminReviews();

  return (
    <StubPage
      title={`Stats (active roles: ${roles.join(", ") || "none"})`}
      actorRole="role-aware"
      hookName="composed per role — see sections"
    >
      <StubGet title="Customer: my profile" actorRole="customer" hookName="useGetUsersMe" query={userQuery} />
      {roles.includes("winemaker") && (
        <>
          <StubGet
            title="Winemaker: my wines (filter winemakerId=me — verify BE)"
            actorRole="winemaker"
            hookName="useGetWines"
            query={myWinesQuery}
          />
          <StubGet
            title="Winemaker: my events (filter winemakerId=me — verify BE)"
            actorRole="winemaker"
            hookName="useGetEvents"
            query={myEventsQuery}
          />
          <StubGet
            title="Winemaker: my supply agreements"
            actorRole="winemaker"
            hookName="useGetSupplyAgreementsWinemaker"
            query={supplyQuery}
          />
        </>
      )}
      {roles.includes("shop_owner") && (
        <StubGet
          title="Shop owner: my shops"
          actorRole="shop_owner"
          hookName="useGetShops (filter ownerUserId=me — verify BE)"
          query={myShopsQuery}
        />
      )}
      {roles.includes("admin") && (
        <>
          <StubGet title="Admin: all users" actorRole="admin" hookName="useGetAdminUsers" query={adminUsersQuery} />
          <StubGet title="Admin: pending role requests" actorRole="admin" hookName="useGetRoleRequests" query={adminRoleReqQuery} />
          <StubGet title="Admin: pending events" actorRole="admin" hookName="useGetAdminEvents" query={adminEventsQuery} />
          <StubGet title="Admin: review moderation queue" actorRole="admin" hookName="useGetAdminReviews" query={adminReviewsQuery} />
        </>
      )}
    </StubPage>
  );
}
