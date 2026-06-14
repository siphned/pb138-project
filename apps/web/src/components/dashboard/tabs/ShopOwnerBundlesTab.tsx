import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useGetProducts } from "@/generated/hooks/useGetProducts";
import { TabPreviewShell } from "./TabPreviewShell";

interface BundleRow {
  id: string;
  name: string;
  price?: string | number;
  quantity?: number;
  shop?: { id?: string; name?: string };
}

interface ShopOwnerBundlesTabProps {
  shopId?: string;
}

export function ShopOwnerBundlesTab({ shopId }: ShopOwnerBundlesTabProps) {
  const query = useGetProducts({ isBundle: true, shopId }, { query: { enabled: !!shopId } });

  if (!shopId) {
    return (
      <div className="rounded-md border border-border bg-card p-8 text-center">
        <h3 className="font-medium text-foreground">Pick a shop to manage bundles</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Bundles belong to a specific shop. Select one above to view or create bundles.
        </p>
      </div>
    );
  }

  const list = ((query.data as { data?: BundleRow[] } | undefined)?.data ?? []) as BundleRow[];
  const bundles = list.slice(0, 10);
  const hasMore = list.length > 10;

  return (
    <TabPreviewShell
      emptyDescription="Multi-wine bundles you create will appear here."
      emptyTitle="No bundles yet"
      hasMore={hasMore}
      isEmpty={!query.isLoading && bundles.length === 0}
      isError={query.isError}
      isLoading={query.isLoading}
      onRetry={() => query.refetch()}
      viewAllTo="/products"
    >
      <div className="flex justify-end">
        <Button render={<Link params={{ id: shopId }} to="/shops/$id/bundles/new" />} size="sm">
          + Create bundle
        </Button>
      </div>
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
              <p className="text-xs text-muted-foreground">
                {b.shop?.name ?? "Your shop"}
                {b.quantity !== undefined && ` · ${b.quantity} in stock`}
              </p>
            </div>
            {b.price !== undefined && (
              <span className="font-medium text-foreground">€{b.price}</span>
            )}
          </li>
        ))}
      </ul>
    </TabPreviewShell>
  );
}
