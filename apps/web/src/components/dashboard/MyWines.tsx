import { DrinkIcon, ShoppingBag01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BundlesListTab } from "./BundlesListTab";
import { CustomerOrderHistoryTab } from "./CustomerOrderHistoryTab";
import { EventsListTab } from "./EventsListTab";
import { ShopOwnerInventoryTab } from "./ShopOwnerInventoryTab";
import { WinemakerInventoryTab } from "./WinemakerInventoryTab";

interface MyWinesProps {
  role?: "Winemaker" | "Shop Owner" | "Customer" | string;
}

export function MyWines({ role = "Winemaker" }: MyWinesProps) {
  let mainTab = <WinemakerInventoryTab />;
  if (role === "Customer") mainTab = <CustomerOrderHistoryTab />;
  else if (role === "Shop Owner") mainTab = <ShopOwnerInventoryTab />;

  return (
    <div className="flex flex-col gap-6 space-y-6 mt-6">
      <Tabs className="w-full" defaultValue="main">
        <TabsList className="w-full justify-start h-14 bg-secondary/40 rounded-2xl p-1 gap-2">
          <TabsTrigger
            className="flex-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
            value="main"
          >
            {role === "Customer" ? (
              <HugeiconsIcon className="h-4 w-4 mr-2" icon={ShoppingBag01Icon} />
            ) : (
              <HugeiconsIcon className="h-4 w-4 mr-2" icon={DrinkIcon} />
            )}
            {role === "Customer" ? "Order History" : "My Wines"}
          </TabsTrigger>
          {role !== "Customer" && (
            <TabsTrigger
              className="flex-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
              value="bundles"
            >
              Bundles
            </TabsTrigger>
          )}
          <TabsTrigger
            className="flex-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
            value="events"
          >
            Events
          </TabsTrigger>
        </TabsList>

        <TabsContent className="mt-6" value="main">
          <Card className="bg-secondary/40 border-none shadow-none rounded-3xl">
            <CardContent className="p-6 md:p-8">{mainTab}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="mt-6" value="bundles">
          <Card className="bg-secondary/40 border-none shadow-none rounded-3xl">
            <CardContent className="p-6 md:p-8">
              <BundlesListTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="mt-6" value="events">
          <Card className="bg-secondary/40 border-none shadow-none rounded-3xl">
            <CardContent className="p-6 md:p-8">
              <EventsListTab />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
