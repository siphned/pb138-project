import { Link } from "@tanstack/react-router";
import { useGetWinemakersMe } from "@/generated/hooks/useGetWinemakersMe";
import { useGetWines } from "@/generated/hooks/useGetWines";
import { WineRowMenu } from "@/routes/-components/WineRowMenu";
import { TabPreviewShell } from "@/routes/_authenticated/-components/TabPreviewShell";

interface WineRow {
  id: string;
  name: string;
  color?: string;
  vintageYear?: string | number;
  region?: string;
}

export function WinemakerWinesTab() {
  const me = useGetWinemakersMe();
  const winemakerId = me.data?.id;

  const query = useGetWines(
    { winemakerId: winemakerId ?? undefined },
    { query: { enabled: !!winemakerId } }
  );

  const rows = (Array.isArray(query.data) ? query.data : []) as WineRow[];
  const wines = rows.slice(0, 10);
  const hasMore = rows.length > 10;

  return (
    <TabPreviewShell
      createLabel="+ Add Wine"
      createTo="/wines/new"
      emptyDescription="Your wines will appear here once you add them."
      emptyTitle="No wines yet"
      hasMore={hasMore}
      isEmpty={!query.isLoading && wines.length === 0}
      isError={query.isError}
      isLoading={query.isLoading || me.isLoading}
      onRetry={() => query.refetch()}
      viewAllTo="/wines"
    >
      <ul className="divide-y divide-border rounded-md border border-border">
        {wines.map((wine) => (
          <li className="flex items-center justify-between gap-4 p-4" key={wine.id}>
            <div className="min-w-0 flex-1">
              <Link
                className="font-medium text-foreground hover:text-primary"
                params={{ id: wine.id }}
                search={{ page: 1, sort: "name" }}
                to="/wines/$id"
              >
                {wine.name}
              </Link>
              <p className="text-xs text-muted-foreground">
                {[wine.color, wine.region, wine.vintageYear].filter(Boolean).join(" · ")}
              </p>
            </div>
            <WineRowMenu onDeleted={() => query.refetch()} wineId={wine.id} wineName={wine.name} />
          </li>
        ))}
      </ul>
    </TabPreviewShell>
  );
}
