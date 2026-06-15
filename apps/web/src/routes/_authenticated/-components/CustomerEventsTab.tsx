import { useGetEvents } from "@/generated/hooks/useGetEvents";
import {
  DashboardEventList,
  type DashboardEventRow,
} from "@/routes/_authenticated/-components/DashboardEventList";
import { TabPreviewShell } from "@/routes/_authenticated/-components/TabPreviewShell";

export function CustomerEventsTab() {
  const query = useGetEvents();
  const raw = query.data;
  const all = (() => {
    if (Array.isArray(raw)) return raw as DashboardEventRow[];
    return ((raw as { data?: DashboardEventRow[] } | undefined)?.data ?? []) as DashboardEventRow[];
  })();
  const registered = all.filter((e) => e.isRegisteredByMe);

  return (
    <TabPreviewShell
      emptyDescription="Events you register for will show up here."
      emptyTitle="No registered events"
      hasMore={registered.length > 10}
      isEmpty={!query.isLoading && registered.length === 0}
      isError={query.isError}
      isLoading={query.isLoading}
      onRetry={() => query.refetch()}
      viewAllTo="/events"
    >
      <DashboardEventList events={registered} />
    </TabPreviewShell>
  );
}
