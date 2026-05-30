import { Link } from "@tanstack/react-router";
import { useGetEvents } from "@/generated/hooks/useGetEvents";
import { TabPreviewShell } from "./TabPreviewShell";

interface EventRow {
  id: string;
  name?: string;
  title?: string;
  startTime?: string | Date;
  startDate?: string | Date;
  isRegisteredByMe?: boolean;
}

function formatDate(value?: string | Date) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function CustomerEventsTab() {
  const query = useGetEvents();
  const raw = query.data;
  const all = (() => {
    if (Array.isArray(raw)) return raw as EventRow[];
    return ((raw as { data?: EventRow[] } | undefined)?.data ?? []) as EventRow[];
  })();
  const registered = all.filter((e) => e.isRegisteredByMe);
  const events = registered.slice(0, 10);
  const hasMore = registered.length > 10;

  return (
    <TabPreviewShell
      emptyDescription="Events you register for will show up here."
      emptyTitle="No registered events"
      hasMore={hasMore}
      isEmpty={!query.isLoading && events.length === 0}
      isError={query.isError}
      isLoading={query.isLoading}
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
