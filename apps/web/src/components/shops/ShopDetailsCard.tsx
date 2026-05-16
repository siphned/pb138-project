import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DescriptionList, PropertyRow } from "@/components/primitives/description-list";
import { ShowOwner } from "@/components/primitives/show-owner";
import { ShopHoursDisplay } from "@/routes/-components/ShopHoursDisplay";
import { ShopManageMenu } from "./ShopManageMenu";
import type { GetShopsById200 } from "@/generated/types/GetShopsById";

interface ShopDetailsCardProps {
  shop: GetShopsById200;
}

export function ShopDetailsCard({ shop }: ShopDetailsCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-bold">About this shop</CardTitle>
        <ShowOwner ownerUserId={shop.ownerUserId}>
          <ShopManageMenu shop={shop} />
        </ShowOwner>
      </CardHeader>
      <CardContent className="space-y-6">
        {shop.description && (
          <div className="prose prose-sm dark:prose-invert">
            <p className="text-muted-foreground">{shop.description}</p>
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Contact & Location
            </h4>
            <DescriptionList>
              <PropertyRow
                label="Address"
                value={
                  <>
                    {shop.address.street} {shop.address.houseNumber}
                    <br />
                    {shop.address.postalCode} {shop.address.city}
                    <br />
                    {shop.address.country}
                  </>
                }
              />
              {/* TODO: Add phone/email if BE adds them */}
            </DescriptionList>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Opening Hours
            </h4>
            <ShopHoursDisplay shopId={shop.id} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
