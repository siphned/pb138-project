import { Link } from "@tanstack/react-router";
import { useGetAdminEvents } from "@/generated/hooks/useGetAdminEvents";
import { TabPreviewShell } from "./TabPreviewShell";

interface AdminEventRow {
  id: string;
  name?: string;
  title?: string;
  status?: string;
  startTime?: string | Date;
  winemaker?: { name?: string };
}

function formatDate(value?: string | Date) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AdminEventApprovalsTab() {
  const query = useGetAdminEvents({ status: "pending" });
  const raw = query.data;
  const list = (Array.isArray(raw)
    ? raw
    : ((raw as { data?: AdminEventRow[] } | undefined)?.data ?? [])) as AdminEventRow[];
  const events = list.slice(0, 10);
  const hasMore = list.length > 10;

  return (
    <TabPreviewShell
      emptyDescription="Events submitted by winemakers awaiting your approval will appear here."
      emptyTitle="No pending events"
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
          const date = formatDate(ev.startTime);
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
                <p className="text-xs text-muted-foreground">
                  {[ev.winemaker?.name, date, ev.status].filter(Boolean).join(" · ")}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </TabPreviewShell>
  );
}
