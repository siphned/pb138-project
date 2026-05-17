import { DataGrid } from "@/components/primitives/data-grid";
import { LoadingState } from "@/components/primitives/loading-state";
import { Section } from "@/components/primitives/section";
import { useGetShopsMe } from "@/generated/hooks/useGetShopsMe";
import { StatTile } from "./StatTile";

// TODO(BE): per-shop aggregator endpoint (`useGetShopsMeStats`) for product /
// bundle counts and stock value — iterating `useGetShopsByIdProducts` from FE
// is not possible without dynamic hook calls.
// TODO(BE): expose `useGetOrdersByShopId` (or `/orders/me/shops`) for Orders
// processed and Revenue tiles.
export function ShopOwnerStatsSection() {
  const shopsQuery = useGetShopsMe();

  if (shopsQuery.isLoading) {
    return (
      <Section heading="Shop performance">
        <LoadingState variant="catalog" />
      </Section>
    );
  }

  const shops = (shopsQuery.data ?? []) as Array<unknown>;
  const shopsCount = Array.isArray(shops) ? shops.length : 0;

  return (
    <Section heading="Shop performance">
      <DataGrid variant="gallery">
        <StatTile label="Shops" value={shopsCount} />
        <StatTile hint="BE backlog" label="Products" value="—" />
        <StatTile hint="BE backlog" label="Bundles" value="—" />
        <StatTile hint="BE backlog" label="Total stock value" value="—" />
        <StatTile hint="BE backlog" label="Orders processed" value="—" />
        <StatTile hint="BE backlog" label="Revenue" value="—" />
      </DataGrid>
    </Section>
  );
}
