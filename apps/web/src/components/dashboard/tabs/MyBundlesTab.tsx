import { Role } from "@/types/roles";
import { ShopOwnerBundles } from "./bundles/ShopOwnerBundles";
import { WinemakerBundles } from "./bundles/WinemakerBundles";

interface MyBundlesTabProps {
  role?: Role;
}

export function MyBundlesTab({ role = Role.winemaker }: MyBundlesTabProps) {
  // Defensive check: If a customer somehow gets here, render nothing.
  if (role === Role.customer) return null;

  // Route to the correct component
  if (role === Role.shopOwner) {
    return <ShopOwnerBundles />;
  }

  // Default to Winemaker
  return <WinemakerBundles />;
}
