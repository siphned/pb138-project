import type { ReactNode } from "react";
import { useState } from "react";
import { AdminRoleRequestsTab } from "@/components/dashboard/tabs/AdminRoleRequestsTab";
import { AdminUsersTab } from "@/components/dashboard/tabs/AdminUsersTab";
import { CustomerEventsTab } from "@/components/dashboard/tabs/CustomerEventsTab";
import { CustomerOrdersTab } from "@/components/dashboard/tabs/CustomerOrdersTab";
import { ShopOwnerBundlesTab } from "@/components/dashboard/tabs/ShopOwnerBundlesTab";
import { ShopOwnerOrdersTab } from "@/components/dashboard/tabs/ShopOwnerOrdersTab";
import { ShopOwnerShopsTab } from "@/components/dashboard/tabs/ShopOwnerShopsTab";
import { ShopSelector } from "@/components/dashboard/tabs/ShopSelector";
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
          content: <WinemakerEventsTab />,
          label: "My Events",
          value: "events",
        },
      ];
    }

    if (activeRole === Role.shopOwner) {
      const shopId = selectedShopId === "all" ? undefined : selectedShopId;
      return [
        {
          content: <ShopOwnerShopsTab shopId={shopId} />,
          label: "My Shops",
          value: "shops",
        },
        {
          content: <ShopOwnerBundlesTab shopId={shopId} />,
          label: "Bundles",
          value: "bundles",
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
          content: <AdminUsersTab />,
          label: "Users",
          value: "users",
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
      {activeRole === Role.shopOwner && (
        <div className="flex justify-end">
          <ShopSelector onChange={setSelectedShopId} value={selectedShopId} />
        </div>
      )}

      <TabsList className="w-full">
        {tabs.map((t) => (
          <TabsTrigger key={t.value} value={t.value}>
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((t) => (
        <TabsContent className="pt-4" key={t.value} value={t.value}>
          {t.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

