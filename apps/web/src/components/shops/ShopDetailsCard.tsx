import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DescriptionList, PropertyRow } from "@/components/primitives/description-list";
import { ShopHoursDisplay } from "@/routes/-components/ShopHoursDisplay";
import type { GetShopsById200 } from "@/generated/types/GetShopsById";

interface ShopDetailsCardProps {
  shop: GetShopsById200;
}

export function ShopDetailsCard({ shop }: ShopDetailsCardProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">Contact & Location</CardTitle>
        </CardHeader>
        <CardContent>
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
          </DescriptionList>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-bold">Opening Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <ShopHoursDisplay shopId={shop.id} />
        </CardContent>
      </Card>
    </div>
  );
}
