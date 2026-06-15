import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useGetShopsByIdProducts } from "@/generated/hooks/useGetShopsByIdProducts";
import { useGetShopsMe } from "@/generated/hooks/useGetShopsMe";
import { ProductRowMenu } from "@/routes/-components/ProductRowMenu";
import { ShopRowMenu } from "@/routes/_authenticated/-components/ShopRowMenu";
import { TabPreviewShell } from "@/routes/_authenticated/-components/TabPreviewShell";

interface ShopRow {
  id: string;
  name: string;
  address?: { city?: string; country?: string };
}

interface ProductRow {
  id: string;
  name: string;
  quantity?: number;
  isBundle?: boolean;
  shopId?: string;
}

interface ShopOwnerShopsTabProps {
  /** Specific shop id, or undefined for "all shops" mode. */
  shopId?: string;
}

export function ShopOwnerShopsTab({ shopId }: ShopOwnerShopsTabProps) {
  const me = useGetShopsMe();
  const allShops = (Array.isArray(me.data) ? me.data : []) as ShopRow[];

  const inventoryQuery = useGetShopsByIdProducts(
    shopId ?? "",
    {},
    { query: { enabled: !!shopId } }
  );

  const inventoryList = ((inventoryQuery.data as { data?: ProductRow[] } | undefined)?.data ??
    []) as ProductRow[];
  const products = inventoryList.slice(0, 10);
  const hasMoreInventory = inventoryList.length > 10;

  // When a specific shop is selected, scope the list to that one shop so
  // every section of this tab is in sync with the selector.
  const visibleShops = shopId ? allShops.filter((s) => s.id === shopId) : allShops;
  const shopsToShow = visibleShops.slice(0, 10);
  const hasMoreShops = visibleShops.length > 10;

  const selectedShop = shopId ? allShops.find((s) => s.id === shopId) : undefined;

  return (
    <div className="space-y-8">
      {/* Shops list */}
      <TabPreviewShell
        createLabel="+ Create shop"
        createTo="/shops/new"
        emptyDescription="Create your first shop to start selling wine."
        emptyTitle="No shops yet"
        hasMore={hasMoreShops}
        isEmpty={!me.isLoading && allShops.length === 0}
        isError={me.isError}
        isLoading={me.isLoading}
        onRetry={() => me.refetch()}
        viewAllTo="/shops"
      >
        <ul className="divide-y divide-border rounded-md border border-border">
          {shopsToShow.map((s) => (
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
              <ShopRowMenu shopId={s.id} shopName={s.name} />
            </li>
          ))}
        </ul>
      </TabPreviewShell>

      {/* Inventory section — only shown when a specific shop is selected. */}
      {shopId && selectedShop && (
        <>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Inventory · {selectedShop.name}
              </h3>
              <Button
                render={
                  <Link
                    params={{ id: shopId }}
                    search={{ isBundle: undefined }}
                    to="/shops/$id/inventory/new"
                  />
                }
                size="sm"
              >
                + Add product
              </Button>
            </div>

            <TabPreviewShell
              emptyDescription="Add products or multi-wine bundles to this shop's catalog."
              emptyTitle="No products yet"
              hasMore={hasMoreInventory}
              isEmpty={!inventoryQuery.isLoading && products.length === 0}
              isError={inventoryQuery.isError}
              isLoading={inventoryQuery.isLoading}
              onRetry={() => inventoryQuery.refetch()}
              viewAllTo={`/shops/${shopId}/inventory` as never}
            >
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
                    <ProductRowMenu
                      onDeleted={() => inventoryQuery.refetch()}
                      productId={p.id}
                      productName={p.name}
                      shopId={shopId}
                    />
                  </li>
                ))}
              </ul>
            </TabPreviewShell>
          </div>
        </>
      )}
    </div>
  );
}
