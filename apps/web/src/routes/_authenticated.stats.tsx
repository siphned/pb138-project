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
import { Role } from "@/types/roles";

export const Route = createFileRoute("/_authenticated/stats")({
  component: StatsStub,
});

function StatsStub() {
  const { user } = useUser();
  const roles = user?.roles ?? [];
  const isWinemaker = roles.includes(Role.winemaker);
  const isShopOwner = roles.includes(Role.shopOwner);
  const isAdmin = roles.includes(Role.admin);

  const userQuery = useGetUsersMe();
  // Winemaker-only queries
  const myWinesQuery = useGetWines({}, { query: { enabled: isWinemaker } });
  const myEventsQuery = useGetEvents({}, { query: { enabled: isWinemaker } });
  const supplyQuery = useGetSupplyAgreementsWinemaker({
    query: { enabled: isWinemaker },
  });
  // Shop-owner-only queries
  const myShopsQuery = useGetShops({}, { query: { enabled: isShopOwner } });
  // Admin-only queries
  const adminUsersQuery = useGetAdminUsers({}, { query: { enabled: isAdmin } });
  const adminRoleReqQuery = useGetRoleRequests({ query: { enabled: isAdmin } });
  const adminEventsQuery = useGetAdminEvents({}, { query: { enabled: isAdmin } });
  const adminReviewsQuery = useGetAdminReviews({}, { query: { enabled: isAdmin } });

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
      {isWinemaker && (
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
      {isShopOwner && (
        <StubGet
          actorRole="shop_owner"
          hookName="useGetShops (filter ownerUserId=me — verify BE)"
          query={myShopsQuery}
          title="Shop owner: my shops"
        />
      )}
      {isAdmin && (
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
