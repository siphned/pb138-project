import { Link } from "@tanstack/react-router";

export interface DashboardEventRow {
  id: string;
  name?: string;
  title?: string;
  startTime?: string | Date;
  startDate?: string | Date;
  endTime?: string | Date;
  endDate?: string | Date;
  isRegisteredByMe?: boolean;
}

/** Max items shown per group in the dashboard preview. */
const GROUP_LIMIT = 5;

function formatDate(value?: string | Date) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function startMs(ev: DashboardEventRow) {
  const v = ev.startTime ?? ev.startDate;
  return v ? new Date(v).getTime() : 0;
}

function endMs(ev: DashboardEventRow) {
  const v = ev.endTime ?? ev.endDate ?? ev.startTime ?? ev.startDate;
  return v ? new Date(v).getTime() : 0;
}

function EventItem({ ev }: { ev: DashboardEventRow }) {
  const title = ev.title ?? ev.name ?? "Untitled event";
  const date = formatDate(ev.startTime ?? ev.startDate);
  return (
    <li className="flex items-center justify-between gap-4 p-4">
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
}

/**
 * Renders the dashboard event preview split into "Upcoming" and "Past" groups
 * within a single bordered list (no separate table). Upcoming events sort
 * soonest-first; past events most-recent-first.
 */
export function DashboardEventList({ events }: { events: DashboardEventRow[] }) {
  const now = Date.now();
  const upcoming = events
    .filter((e) => endMs(e) >= now)
    .sort((a, b) => startMs(a) - startMs(b))
    .slice(0, GROUP_LIMIT);
  const past = events
    .filter((e) => endMs(e) < now)
    .sort((a, b) => startMs(b) - startMs(a))
    .slice(0, GROUP_LIMIT);

  return (
    <ul className="divide-y divide-border rounded-md border border-border">
      {upcoming.length > 0 && (
        <>
          <li className="bg-muted/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Upcoming
          </li>
          {upcoming.map((ev) => (
            <EventItem ev={ev} key={ev.id} />
          ))}
        </>
      )}
      {past.length > 0 && (
        <>
          <li className="bg-muted/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Past
          </li>
          {past.map((ev) => (
            <EventItem ev={ev} key={ev.id} />
          ))}
        </>
      )}
    </ul>
  );
}
