import { Link } from "@tanstack/react-router";
import { useGetShopsMe } from "@/generated/hooks/useGetShopsMe";
import { TabPreviewShell } from "./TabPreviewShell";

interface ShopRow {
  id: string;
  name: string;
  address?: { city?: string; country?: string };
}

export function ShopOwnerShopsTab() {
  const query = useGetShopsMe();
  const rows = (Array.isArray(query.data) ? query.data : []) as ShopRow[];
  const shops = rows.slice(0, 10);
  const hasMore = rows.length > 10;

  return (
    <TabPreviewShell
      createLabel="+ Create shop"
      createTo="/shops/new"
      emptyDescription="Create your first shop to start selling wine."
      emptyTitle="No shops yet"
      hasMore={hasMore}
      isEmpty={!query.isLoading && shops.length === 0}
      isError={query.isError}
      isLoading={query.isLoading}
      onRetry={() => query.refetch()}
      viewAllTo="/shops"
    >
      <ul className="divide-y divide-border rounded-md border border-border">
        {shops.map((s) => (
          <li className="flex items-center justify-between gap-4 p-4" key={s.id}>
            <div className="min-w-0 flex-1">
              <Link
                className="font-medium text-foreground hover:text-primary"
                params={{ id: s.id }}
                to="/shops/$id"
              >
                {s.name}
              </Link>
              {s.address && (
                <p className="text-xs text-muted-foreground">
                  {[s.address.city, s.address.country].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </TabPreviewShell>
  );
}
