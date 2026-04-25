import { Calendar, Package, ShoppingBag, Wine } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Role } from "@/types/roles";

import { EventsTab } from "./tabs/EventsTab";
import { MyBundlesTab } from "./tabs/MyBundlesTab";
// We will create these 3 skeletons next!
import { WinesTab } from "./tabs/WinesTab";

interface DashboardTabsProps {
  role?: Role;
}

export function DashboardTabs({ role = Role.winemaker }: DashboardTabsProps) {
  const isCustomer = role === Role.customer;

  return (
    <div className="flex flex-col gap-6 space-y-6 mt-6">
      <Tabs defaultValue="main" className="flex flex-col w-full">
        {/* THE NAVBAR (TabsList) */}
        <TabsList className="w-full justify-start h-14 bg-secondary/40 rounded-2xl p-1 gap-2">
          <TabsTrigger
            value="main"
            className="flex-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            {isCustomer ? (
              <ShoppingBag className="h-4 w-4 mr-2" />
            ) : (
              <Wine className="h-4 w-4 mr-2" />
            )}
            {isCustomer ? "Order History" : "My Wines"}
          </TabsTrigger>

          {/* Hide Bundles tab entirely if the user is a Customer */}
          {!isCustomer && (
            <TabsTrigger
              value="bundles"
              className="flex-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Package className="h-4 w-4 mr-2" />
              Bundles
            </TabsTrigger>
          )}

          <TabsTrigger
            value="events"
            className="flex-1 rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Events
          </TabsTrigger>
        </TabsList>

        {/* THE CONTENT AREAS */}
        <TabsContent value="main" className="mt-6">
          <Card className="bg-secondary/40 border-none shadow-none rounded-3xl">
            <CardContent className="p-6 md:p-8">
              {/* Inject the separated Wines component and pass the role down */}
              <WinesTab role={role} />
            </CardContent>
          </Card>
        </TabsContent>

        {!isCustomer && (
          <TabsContent value="bundles" className="mt-6">
            <Card className="bg-secondary/40 border-none shadow-none rounded-3xl">
              <CardContent className="p-6 md:p-8">
                {/* Inject the separated Bundles component */}
                <MyBundlesTab role={role} />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="events" className="mt-6">
          {/* Note: Events usually has its own background styling in your design, so we skip the Card wrapper here */}
          <div className="space-y-6">
            {/* Inject the separated Events component */}

            <EventsTab role={role} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
