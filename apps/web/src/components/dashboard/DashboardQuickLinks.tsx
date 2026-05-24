import {
  Calendar03Icon,
  PackageIcon,
  Search01Icon,
  Setting07Icon,
  ShieldUserIcon,
  ShoppingBasket01Icon,
  ShoppingCart01Icon,
  Store01Icon,
  UserMultipleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";

interface QuickLink {
  icon: typeof Calendar03Icon;
  label: string;
  to: string;
}

const LINKS_BY_ROLE: Record<string, QuickLink[]> = {
  Customer: [
    { icon: ShoppingBasket01Icon, label: "My orders", to: "/orders" },
    { icon: ShoppingCart01Icon, label: "My cart", to: "/cart" },
    { icon: Search01Icon, label: "Explore wines", to: "/explore" },
    { icon: Calendar03Icon, label: "Upcoming events", to: "/events" },
  ],
  Winemaker: [
    { icon: Calendar03Icon, label: "Host an event", to: "/events/new" },
    { icon: Search01Icon, label: "Browse the catalog", to: "/explore" },
    { icon: Store01Icon, label: "Find retail partners", to: "/shops" },
    { icon: Setting07Icon, label: "Account settings", to: "/dashboard" },
  ],
  "Shop Owner": [
    { icon: Store01Icon, label: "My shops", to: "/shops" },
    { icon: Store01Icon, label: "Open a new shop", to: "/shops/new" },
    { icon: PackageIcon, label: "Browse supply", to: "/explore" },
    { icon: Calendar03Icon, label: "Upcoming events", to: "/events" },
  ],
  Admin: [
    { icon: UserMultipleIcon, label: "User management", to: "/admin/users" },
    { icon: ShieldUserIcon, label: "Content moderation", to: "/admin/moderation" },
    { icon: Calendar03Icon, label: "Event approvals", to: "/admin/events" },
    { icon: ShieldUserIcon, label: "Role requests", to: "/admin/role-requests" },
  ],
};

export function DashboardQuickLinks() {
  const { user, activeRole } = useUser();
  if (!user) return null;

  const links = LINKS_BY_ROLE[activeRole] ?? [];
  if (links.length === 0) return null;

  return (
    <div
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      data-slot="dashboard-quick-links"
    >
      {links.map((link) => (
        <Button
          className="h-auto justify-start gap-3 px-4 py-3"
          key={link.to + link.label}
          render={<Link to={link.to} />}
          variant="outline"
        >
          <HugeiconsIcon className="h-5 w-5 text-muted-foreground" icon={link.icon} />
          <span className="text-sm font-medium">{link.label}</span>
        </Button>
      ))}
    </div>
  );
}
