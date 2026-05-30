import { Link } from "@tanstack/react-router";
import { useGetShopsByIdProducts } from "@/generated/hooks/useGetShopsByIdProducts";
import { useGetShopsMe } from "@/generated/hooks/useGetShopsMe";
import { Button } from "@/components/ui/button";
import { TabPreviewShell } from "./TabPreviewShell";

interface ProductRow {
  id: string;
  name: string;
  price?: string | number;
  quantity?: number;
  isBundle?: boolean;
}

interface ShopOwnerInventoryTabProps {
  /** Specific shop id, or undefined for "all shops" mode. */
  shopId?: string;
}

export function ShopOwnerInventoryTab({ shopId }: ShopOwnerInventoryTabProps) {
  const me = useGetShopsMe();
  const fallbackShopId = !shopId && Array.isArray(me.data) ? me.data[0]?.id : undefined;
  const effectiveShopId = shopId ?? fallbackShopId;

  const query = useGetShopsByIdProducts(
    effectiveShopId ?? "",
    {},
    { query: { enabled: !!effectiveShopId } }
  );

  const list = ((query.data as { data?: ProductRow[] } | undefined)?.data ?? []) as ProductRow[];
  const products = list.slice(0, 10);
  const hasMore = list.length > 10;

  return (
    <TabPreviewShell
      emptyDescription="Add products or multi-wine bundles to your shop's catalog."
      emptyTitle="No products yet"
      hasMore={hasMore}
      isEmpty={!query.isLoading && !!effectiveShopId && products.length === 0}
      isError={query.isError}
      isLoading={query.isLoading || me.isLoading}
      onRetry={() => query.refetch()}
      viewAllTo={
        effectiveShopId
          ? (`/shops/${effectiveShopId}/inventory` as never)
          : undefined
      }
    >
      {effectiveShopId ? (
        <>
          <div className="flex justify-end">
            <Button
              render={
                <Link
                  params={{ id: effectiveShopId }}
                  search={{ isBundle: undefined }}
                  to="/shops/$id/inventory/new"
                />
              }
              size="sm"
            >
              + Add product
            </Button>
          </div>
          <ul className="divide-y divide-border rounded-md border border-border">
            {products.map((p) => (
              <li className="flex items-center justify-between gap-4 p-4" key={p.id}>
                <div className="min-w-0 flex-1">
                  <Link
                    className="font-medium text-foreground hover:text-primary"
                    params={{ productId: p.id }}
                    to="/products/$productId"
                  >
                    {p.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {p.isBundle ? "Bundle" : "Product"}
                    {p.quantity !== undefined && ` · ${p.quantity} in stock`}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Create or select a shop first.
        </p>
      )}
    </TabPreviewShell>
  );
}
