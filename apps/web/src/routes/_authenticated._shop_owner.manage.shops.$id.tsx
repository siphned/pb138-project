// @ts-nocheck - route not yet in routeTree.gen.ts; suppress until tsr generate is run

import { AlertTriangleIcon, ShieldCrossIcon } from "@hugeicons/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LoadingState } from "@/components/primitives/loading-state";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/context/UserContext";
import { useGetShopsById } from "@/generated/hooks/useGetShopsById";
import { InventoryTab } from "./-components/InventoryTab";
import { OrdersTab } from "./-components/OrdersTab";
import { ShopEditForm } from "./-components/ShopEditForm";
import { ShopOverviewTab } from "./-components/ShopOverviewTab";
import { SupplyTab } from "./-components/SupplyTab";

export const Route = createFileRoute("/_authenticated/_shop_owner/manage/shops/$id")({
  component: ShopManagementPage,
  validateSearch: (search) => ({
    tab: typeof search.tab === "string" ? search.tab : "overview",
  }),
});

function ShopManagementPage() {
  const { id } = Route.useParams();
  const { tab } = Route.useSearch();
  const { user } = useUser();
  const navigate = useNavigate();

  const { data: shop, isLoading, isError } = useGetShopsById(id);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <LoadingState variant="detail" />
      </div>
    );
  }

  if (isError || !shop) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="flex flex-col items-center justify-center gap-4 py-24">
          <AlertTriangleIcon className="h-12 w-12 text-destructive" />
          <h2 className="text-xl font-semibold">Shop not found</h2>
          <p className="text-muted-foreground">
            The shop you are looking for does not exist or has been removed.
          </p>
          <Button onClick={() => window.history.back()} variant="outline">
            Go back
          </Button>
        </div>
      </div>
    );
  }

  if (!user || shop.ownerUserId !== user.id) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="flex flex-col items-center justify-center gap-4 py-24">
          <ShieldCrossIcon className="h-12 w-12 text-destructive" />
          <h2 className="text-xl font-semibold">Access denied</h2>
          <p className="text-muted-foreground text-center max-w-md">
            You do not have permission to manage this shop. Only the shop owner can access
            management features.
          </p>
          <Button onClick={() => window.history.back()} variant="outline">
            Go back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{shop.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your shop details and inventory
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        onValueChange={(newTab) =>
          navigate({
            search: { tab: newTab },
          })
        }
        value={tab}
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="supply">Supply</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent className="space-y-4" value="overview">
          <ShopOverviewTab
            onTabChange={(newTab) =>
              navigate({
                search: { tab: newTab },
              })
            }
            shop={shop}
          />
        </TabsContent>

        {/* Edit Tab */}
        <TabsContent className="space-y-4" value="edit">
          <ShopEditForm shop={shop} />
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent className="space-y-4" value="inventory">
          <InventoryTab shopId={id} />
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent className="space-y-4" value="orders">
          <OrdersTab shopId={id} />
        </TabsContent>

        {/* Supply Tab */}
        <TabsContent className="space-y-4" value="supply">
          <SupplyTab shopId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
