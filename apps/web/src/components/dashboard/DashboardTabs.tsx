import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useState } from "react";
import { DashboardQuickStats } from "@/components/dashboard/DashboardQuickStats";
import { ShopOwnerInventoryTab } from "@/components/dashboard/tabs/ShopOwnerInventoryTab";
import { ShopOwnerOrdersTab } from "@/components/dashboard/tabs/ShopOwnerOrdersTab";
import { ShopOwnerShopsTab } from "@/components/dashboard/tabs/ShopOwnerShopsTab";
import { ShopSelector } from "@/components/dashboard/tabs/ShopSelector";
import { WinemakerBundlesTab } from "@/components/dashboard/tabs/WinemakerBundlesTab";
import { WinemakerEventsTab } from "@/components/dashboard/tabs/WinemakerEventsTab";
import { WinemakerWinesTab } from "@/components/dashboard/tabs/WinemakerWinesTab";
import { Button } from "@/components/ui/button";
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
          content: <AdminPlaceholderTab to="/admin/role-requests" label="Pending Approvals" />,
          label: "Pending Approvals",
          value: "approvals",
        },
        {
          content: <AdminPlaceholderTab to="/admin/users" label="All Users" />,
          label: "All Users",
          value: "users",
        },
        {
          content: <AdminPlaceholderTab to="/stats" label="Statistics" />,
          label: "Statistics",
          value: "stats",
        },
      ];
    }

    return [
      {
        content: <CustomerOverviewTab />,
        label: "Activity",
        value: "activity",
      },
      {
        content: <CustomerPlaceholderTab to="/orders" label="Order history" />,
        label: "My Orders",
        value: "orders",
      },
      {
        content: <CustomerPlaceholderTab to="/events" label="Upcoming events" />,
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

function CustomerOverviewTab() {
  return <DashboardQuickStats />;
}

function CustomerPlaceholderTab({ to, label }: { to: string; label: string }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-md border border-dashed border-border p-8">
      <p className="text-sm text-muted-foreground">
        Your {label.toLowerCase()} lives on a dedicated page for now.
      </p>
      <Button render={<Link to={to} />} size="sm" variant="outline">
        Open {label}
        <HugeiconsIcon className="ml-2 h-3.5 w-3.5" icon={ArrowRight01Icon} />
      </Button>
    </div>
  );
}

function AdminPlaceholderTab({ to, label }: { to: string; label: string }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-md border border-dashed border-border p-8">
      <p className="text-sm text-muted-foreground">
        Manage {label.toLowerCase()} from the admin module.
      </p>
      <Button render={<Link to={to} />} size="sm" variant="outline">
        Open {label}
        <HugeiconsIcon className="ml-2 h-3.5 w-3.5" icon={ArrowRight01Icon} />
      </Button>
    </div>
  );
}
