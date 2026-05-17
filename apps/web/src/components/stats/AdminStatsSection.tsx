import { DataGrid } from "@/components/primitives/data-grid";
import { LoadingState } from "@/components/primitives/loading-state";
import { Section } from "@/components/primitives/section";
import { useGetAdminEvents } from "@/generated/hooks/useGetAdminEvents";
import { useGetAdminReviews } from "@/generated/hooks/useGetAdminReviews";
import { useGetAdminUsers } from "@/generated/hooks/useGetAdminUsers";
import { useGetProducts } from "@/generated/hooks/useGetProducts";
import { useGetRoleRequests } from "@/generated/hooks/useGetRoleRequests";
import { useGetShops } from "@/generated/hooks/useGetShops";
import { StatTile } from "./StatTile";

type Paged = { total?: string | number; data?: unknown[] };

const totalOf = (resp: unknown): number => {
  if (resp && typeof resp === "object") {
    const r = resp as Paged;
    if (r.total != null) {
      const n = Number(r.total);
      return Number.isFinite(n) ? n : 0;
    }
    if (Array.isArray(r.data)) return r.data.length;
  }
  if (Array.isArray(resp)) return resp.length;
  return 0;
};

// TODO(BE): expose a single `/admin/stats` aggregator so the admin overview
// does not need six parallel list queries (plus a per-status pending events
// call). Also expose `/admin/reviews?status=flagged` for the Flagged reviews
// tile — current endpoint returns *all* reviews.
export function AdminStatsSection() {
  const usersQuery = useGetAdminUsers();
  const eventsQuery = useGetAdminEvents({ status: "pending" });
  const reviewsQuery = useGetAdminReviews();
  const roleRequestsQuery = useGetRoleRequests();
  const shopsQuery = useGetShops();
  const productsQuery = useGetProducts();

  const isLoading =
    usersQuery.isLoading ||
    eventsQuery.isLoading ||
    reviewsQuery.isLoading ||
    roleRequestsQuery.isLoading ||
    shopsQuery.isLoading ||
    productsQuery.isLoading;

  if (isLoading) {
    return (
      <Section heading="Platform overview">
        <LoadingState variant="catalog" />
      </Section>
    );
  }

  return (
    <Section heading="Platform overview">
      <DataGrid variant="gallery">
        <StatTile label="Users (total)" value={totalOf(usersQuery.data)} />
        <StatTile label="Pending role requests" value={totalOf(roleRequestsQuery.data)} />
        <StatTile label="Pending events" value={totalOf(eventsQuery.data)} />
        <StatTile
          hint="All reviews — flagged filter pending BE"
          label="Flagged reviews"
          value={totalOf(reviewsQuery.data)}
        />
        <StatTile label="Total products" value={totalOf(productsQuery.data)} />
        <StatTile label="Total shops" value={totalOf(shopsQuery.data)} />
      </DataGrid>
    </Section>
  );
}
