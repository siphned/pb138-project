import { Role } from "@/types/roles";
import { ShopOwnerBundles } from "./bundles/ShopOwnerBundles";
import { WinemakerBundles } from "./bundles/WinemakerBundles";

interface MyBundlesTabProps {
  role?: Role;
}

export function MyBundlesTab({ role = Role.WINEMAKER }: MyBundlesTabProps) {
  // Defensive check: If a customer somehow gets here, render nothing.
  if (role === Role.CUSTOMER) return null;

  // Route to the correct component
  if (role === Role.SHOP_OWNER) {
    return <ShopOwnerBundles />;
  }

  // Default to Winemaker
  return <WinemakerBundles />;
}
