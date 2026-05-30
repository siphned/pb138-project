import { useGetProducts } from "@/generated/hooks/useGetProducts";
import { Link } from "@tanstack/react-router";
import { TabPreviewShell } from "./TabPreviewShell";

interface BundleRow {
  id: string;
  name: string;
  shop?: { id?: string; name?: string };
}

export function WinemakerBundlesTab() {
  // The BE does not yet support filtering products by winemakerId, so we show
  // the latest bundles available platform-wide as a discovery surface.
  const query = useGetProducts({ isBundle: true });

  const list = ((query.data as { data?: BundleRow[] } | undefined)?.data ?? []) as BundleRow[];
  const bundles = list.slice(0, 5);

  return (
    <TabPreviewShell
      emptyDescription="Bundles featuring your wines will appear here when shop owners create them."
      emptyTitle="No bundles yet"
      isEmpty={!query.isLoading && bundles.length === 0}
      isError={query.isError}
      isLoading={query.isLoading}
      onRetry={() => query.refetch()}
      viewAllTo="/products"
    >
      <ul className="divide-y divide-border rounded-md border border-border">
        {bundles.map((b) => (
          <li className="flex items-center justify-between gap-4 p-4" key={b.id}>
            <div className="min-w-0 flex-1">
              <Link
                className="font-medium text-foreground hover:text-primary"
                params={{ productId: b.id }}
                to="/products/$productId"
              >
                {b.name}
              </Link>
              {b.shop?.name && (
                <p className="text-xs text-muted-foreground">at {b.shop.name}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </TabPreviewShell>
  );
}
