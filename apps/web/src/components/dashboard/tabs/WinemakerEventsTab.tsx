import { Link } from "@tanstack/react-router";
import { useGetEvents } from "@/generated/hooks/useGetEvents";
import { useGetWinemakersMe } from "@/generated/hooks/useGetWinemakersMe";
import { TabPreviewShell } from "./TabPreviewShell";

interface EventRow {
  id: string;
  name?: string;
  title?: string;
  startTime?: string | Date;
  startDate?: string | Date;
}

function formatDate(value?: string | Date) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function WinemakerEventsTab() {
  const me = useGetWinemakersMe();
  const query = useGetEvents(
    { winemakerId: me.data?.id ?? undefined },
    { query: { enabled: !!me.data?.id } }
  );

  const list = (() => {
    const raw = query.data;
    if (Array.isArray(raw)) return raw as EventRow[];
    return ((raw as { data?: EventRow[] } | undefined)?.data ?? []) as EventRow[];
  })();
  const events = list.slice(0, 10);
  const hasMore = list.length > 10;

  return (
    <TabPreviewShell
      createLabel="Schedule Event"
      createTo="/events/new"
      emptyDescription="Tasting events you host will show up here."
      emptyTitle="No events scheduled"
      hasMore={hasMore}
      isEmpty={!query.isLoading && events.length === 0}
      isError={query.isError}
      isLoading={query.isLoading || me.isLoading}
      onRetry={() => query.refetch()}
      viewAllTo="/events"
    >
      <ul className="divide-y divide-border rounded-md border border-border">
        {events.map((ev) => {
          const title = ev.title ?? ev.name ?? "Untitled event";
          const date = formatDate(ev.startTime ?? ev.startDate);
          return (
            <li className="flex items-center justify-between gap-4 p-4" key={ev.id}>
              <div className="min-w-0 flex-1">
                <Link
                  className="font-medium text-foreground hover:text-primary"
                  params={{ id: ev.id }}
                  to="/events/$id"
                >
                  {title}
                </Link>
                {date && <p className="text-xs text-muted-foreground">{date}</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </TabPreviewShell>
  );
}
