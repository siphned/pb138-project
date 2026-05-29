import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { GetShopsById200 } from "@/generated/types/GetShopsById";

interface ShopOverviewTabProps {
  shop: GetShopsById200;
  onTabChange: (tabName: string) => void;
}

export function ShopOverviewTab({ shop, onTabChange }: ShopOverviewTabProps) {
  const handleEditClick = () => {
    onTabChange("edit");
  };

  const handleViewOrdersClick = () => {
    onTabChange("orders");
  };

  return (
    <div className="space-y-4">
      {/* Shop Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Shop Details</CardTitle>
          <CardDescription>Basic information about your shop</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Name</p>
            <p className="text-base font-semibold mt-1">{shop.name}</p>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium text-muted-foreground">Description</p>
            <p className="text-base mt-1">{shop.description || "No description provided"}</p>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium text-muted-foreground">Address</p>
            <p className="text-base mt-1">
              {shop.address.street} {shop.address.houseNumber}
            </p>
            <p className="text-base">
              {shop.address.postalCode} {shop.address.city}
            </p>
            <p className="text-base">{shop.address.country}</p>
          </div>

          <Separator />

          <div className="flex gap-2 pt-4">
            <Button onClick={handleEditClick} variant="default">
              Edit Shop Details
            </Button>
            <Button onClick={handleViewOrdersClick} variant="outline">
              View Orders
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle>Shop Statistics</CardTitle>
          <CardDescription>Overview of your shop activity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <p className="text-base font-semibold mt-1">
                {new Date(shop.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
              <p className="text-base font-semibold mt-1">
                {shop.updatedAt ? new Date(shop.updatedAt).toLocaleDateString() : "Never"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
