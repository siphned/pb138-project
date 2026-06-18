import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/context/UserContext";
import { useGetWinemakersMe } from "@/generated/hooks/useGetWinemakersMe";
import { AdminModerationTab } from "@/routes/_authenticated/-components/AdminModerationTab";
import { AdminRoleRequestsTab } from "@/routes/_authenticated/-components/AdminRoleRequestsTab";
import { AdminUsersTab } from "@/routes/_authenticated/-components/AdminUsersTab";
import { CustomerEventsTab } from "@/routes/_authenticated/-components/CustomerEventsTab";
import { CustomerOrdersTab } from "@/routes/_authenticated/-components/CustomerOrdersTab";
import { ShopOwnerBundlesTab } from "@/routes/_authenticated/-components/ShopOwnerBundlesTab";
import { ShopOwnerOrdersTab } from "@/routes/_authenticated/-components/ShopOwnerOrdersTab";
import { ShopOwnerShopsTab } from "@/routes/_authenticated/-components/ShopOwnerShopsTab";
import { ShopSelector } from "@/routes/_authenticated/-components/ShopSelector";
import { WinemakerEventsTab } from "@/routes/_authenticated/-components/WinemakerEventsTab";
import { WinemakerSupplyTab } from "@/routes/_authenticated/-components/WinemakerSupplyTab";
import { WinemakerWinesTab } from "@/routes/_authenticated/-components/WinemakerWinesTab";
import { Role } from "@/types/roles";

interface TabSpec {
  value: string;
  label: string;
  content: ReactNode;
}

export function DashboardTabs() {
  const { activeRole } = useUser();
  const [selectedShopId, setSelectedShopId] = useState<string | "all">("all");

  // A user can hold the winemaker role without yet having a winemaker profile
  // (profiles aren't auto-created on approval). Without one, every winemaker
  // view 500s, so prompt them to set it up first.
  const isWinemaker = activeRole === Role.winemaker;
  const winemakerProfile = useGetWinemakersMe({ query: { enabled: isWinemaker } });

  if (isWinemaker && !winemakerProfile.isLoading && !winemakerProfile.data) {
    return (
      <div className="rounded-md border border-border bg-muted/50 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          You don't have a winemaker profile yet. Set one up to list wines and receive supply
          requests.
        </p>
        <Button className="mt-4" render={<Link to="/winemakers/new" />}>
          Set up winemaker profile
        </Button>
      </div>
    );
  }

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
        {
          content: <WinemakerSupplyTab />,
          label: "Supply Requests",
          value: "supply",
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
        {
          content: <AdminModerationTab />,
          label: "Content Moderation",
          value: "moderation",
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
    // Remount per role: the tab set (and so the first tab) changes when the
    // active role changes, which would otherwise mutate an uncontrolled Tabs'
    // defaultValue after init (Base UI warning) and leave a stale selected tab.
    <Tabs defaultValue={tabs[0]?.value} key={activeRole}>
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
