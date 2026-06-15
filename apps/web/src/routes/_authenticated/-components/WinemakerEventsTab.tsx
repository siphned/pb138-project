import { useGetEvents } from "@/generated/hooks/useGetEvents";
import { useGetWinemakersMe } from "@/generated/hooks/useGetWinemakersMe";
import {
  DashboardEventList,
  type DashboardEventRow,
} from "@/routes/_authenticated/-components/DashboardEventList";
import { TabPreviewShell } from "@/routes/_authenticated/-components/TabPreviewShell";

export function WinemakerEventsTab() {
  const me = useGetWinemakersMe();
  const query = useGetEvents(
    { winemakerId: me.data?.id ?? undefined },
    { query: { enabled: !!me.data?.id } }
  );

  const list = (() => {
    const raw = query.data;
    if (Array.isArray(raw)) return raw as DashboardEventRow[];
    return ((raw as { data?: DashboardEventRow[] } | undefined)?.data ?? []) as DashboardEventRow[];
  })();

  return (
    <TabPreviewShell
      createLabel="Schedule Event"
      createTo="/events/new"
      emptyDescription="Tasting events you host will show up here."
      emptyTitle="No events scheduled"
      hasMore={list.length > 10}
      isEmpty={!query.isLoading && list.length === 0}
      isError={query.isError}
      isLoading={query.isLoading || me.isLoading}
      onRetry={() => query.refetch()}
      viewAllTo="/events"
    >
      <DashboardEventList events={list} manageable onChanged={() => query.refetch()} />
    </TabPreviewShell>
  );
}
