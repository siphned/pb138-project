import type { ReactNode } from "react";
import { useState } from "react";
import { AdminEventApprovalsTab } from "@/components/dashboard/tabs/AdminEventApprovalsTab";
import { AdminRoleRequestsTab } from "@/components/dashboard/tabs/AdminRoleRequestsTab";
import { CustomerEventsTab } from "@/components/dashboard/tabs/CustomerEventsTab";
import { CustomerOrdersTab } from "@/components/dashboard/tabs/CustomerOrdersTab";
import { ShopOwnerInventoryTab } from "@/components/dashboard/tabs/ShopOwnerInventoryTab";
import { ShopOwnerOrdersTab } from "@/components/dashboard/tabs/ShopOwnerOrdersTab";
import { ShopOwnerShopsTab } from "@/components/dashboard/tabs/ShopOwnerShopsTab";
import { ShopSelector } from "@/components/dashboard/tabs/ShopSelector";
import { WinemakerBundlesTab } from "@/components/dashboard/tabs/WinemakerBundlesTab";
import { WinemakerEventsTab } from "@/components/dashboard/tabs/WinemakerEventsTab";
import { WinemakerWinesTab } from "@/components/dashboard/tabs/WinemakerWinesTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/context/UserContext";
import { Role } from "@/types/roles";

interface TabSpec {
  value: string;
  label: string;
  content: ReactNode;
}

export function DashboardTabs() {
  const { activeRole } = useUser();
  const [selectedShopId, setSelectedShopId] = useState<string | "all">("all");

  const tabs: TabSpec[] = (() => {
    if (activeRole === Role.winemaker) {
      return [
        {
          content: <WinemakerWinesTab />,
          label: "My Wines",
          value: "wines",
        },
        {
          content: <WinemakerBundlesTab />,
          label: "Bundles",
          value: "bundles",
        },
        {
          content: <WinemakerEventsTab />,
          label: "Tasting Events",
          value: "events",
        },
      ];
    }

    if (activeRole === Role.shopOwner) {
      const shopId = selectedShopId === "all" ? undefined : selectedShopId;
      return [
        {
          content: <ShopOwnerShopsTab />,
          label: "My Shops",
          value: "shops",
        },
        {
          content: <ShopOwnerInventoryTab shopId={shopId} />,
          label: "Inventory",
          value: "inventory",
        },
        {
          content: <ShopOwnerOrdersTab shopId={shopId} />,
          label: "Orders",
          value: "orders",
        },
      ];
    }

    if (activeRole === Role.admin) {
      return [
        {
          content: <AdminRoleRequestsTab />,
          label: "Role Requests",
          value: "role-requests",
        },
        {
          content: <AdminEventApprovalsTab />,
          label: "Event Approvals",
          value: "event-approvals",
        },
      ];
    }

    return [
      {
        content: <CustomerOrdersTab />,
        label: "My Orders",
        value: "orders",
      },
      {
        content: <CustomerEventsTab />,
        label: "My Events",
        value: "events",
      },
    ];
  })();

  return (
    <Tabs defaultValue={tabs[0]?.value}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {activeRole === Role.shopOwner && (
          <ShopSelector onChange={setSelectedShopId} value={selectedShopId} />
        )}
      </div>

      {tabs.map((t) => (
        <TabsContent className="pt-4" key={t.value} value={t.value}>
          {t.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

