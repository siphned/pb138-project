import { createFileRoute } from "@tanstack/react-router";
import { StubGet } from "@/components/dev/StubGet";
import { StubPage } from "@/components/dev/StubPage";
import { useUser } from "@/context/UserContext";
import { useGetAdminEvents } from "@/generated/hooks/useGetAdminEvents";
import { useGetAdminReviews } from "@/generated/hooks/useGetAdminReviews";
import { useGetAdminUsers } from "@/generated/hooks/useGetAdminUsers";
import { useGetEvents } from "@/generated/hooks/useGetEvents";
import { useGetRoleRequests } from "@/generated/hooks/useGetRoleRequests";
import { useGetShops } from "@/generated/hooks/useGetShops";
import { useGetSupplyAgreementsWinemaker } from "@/generated/hooks/useGetSupplyAgreementsWinemaker";
import { useGetUsersMe } from "@/generated/hooks/useGetUsersMe";
import { useGetWines } from "@/generated/hooks/useGetWines";

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
      actorRole="role-aware"
      hookName="composed per role — see sections"
      title={`Stats (active roles: ${roles.join(", ") || "none"})`}
    >
      <StubGet
        actorRole="customer"
        hookName="useGetUsersMe"
        query={userQuery}
        title="Customer: my profile"
      />
      {roles.includes("winemaker") && (
        <>
          <StubGet
            actorRole="winemaker"
            hookName="useGetWines"
            query={myWinesQuery}
            title="Winemaker: my wines (filter winemakerId=me — verify BE)"
          />
          <StubGet
            actorRole="winemaker"
            hookName="useGetEvents"
            query={myEventsQuery}
            title="Winemaker: my events (filter winemakerId=me — verify BE)"
          />
          <StubGet
            actorRole="winemaker"
            hookName="useGetSupplyAgreementsWinemaker"
            query={supplyQuery}
            title="Winemaker: my supply agreements"
          />
        </>
      )}
      {roles.includes("shop_owner") && (
        <StubGet
          actorRole="shop_owner"
          hookName="useGetShops (filter ownerUserId=me — verify BE)"
          query={myShopsQuery}
          title="Shop owner: my shops"
        />
      )}
      {roles.includes("admin") && (
        <>
          <StubGet
            actorRole="admin"
            hookName="useGetAdminUsers"
            query={adminUsersQuery}
            title="Admin: all users"
          />
          <StubGet
            actorRole="admin"
            hookName="useGetRoleRequests"
            query={adminRoleReqQuery}
            title="Admin: pending role requests"
          />
          <StubGet
            actorRole="admin"
            hookName="useGetAdminEvents"
            query={adminEventsQuery}
            title="Admin: pending events"
          />
          <StubGet
            actorRole="admin"
            hookName="useGetAdminReviews"
            query={adminReviewsQuery}
            title="Admin: review moderation queue"
          />
        </>
      )}
    </StubPage>
  );
}
