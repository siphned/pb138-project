import { DataGrid } from "@/components/primitives/data-grid";
import { Section } from "@/components/primitives/section";
import { StatTile } from "./StatTile";

// TODO(BE): expose `useGetOrdersMe` (customer order list) for Orders + Total spent tiles.
// TODO(BE): expose `useGetEventRegistrationsMe` for Events attended tile.
// TODO(BE): expose `useGetReviewsMe` for Reviews written tile.
export function CustomerStatsSection() {
  return (
    <Section heading="My activity">
      <DataGrid variant="gallery">
        <StatTile hint="BE backlog" label="Orders" value="—" />
        <StatTile hint="BE backlog" label="Total spent" value="—" />
        <StatTile hint="BE backlog" label="Events attended" value="—" />
        <StatTile hint="BE backlog" label="Reviews written" value="—" />
      </DataGrid>
    </Section>
  );
}
