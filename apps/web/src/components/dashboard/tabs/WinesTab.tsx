import { Role } from "@/types/roles";
import { CustomerOrderHistory } from "./wines/CustomerOrderHistory";
import { ShopOwnerInventory } from "./wines/ShopOwnerInventory";
import { WinemakerInventory } from "./wines/WinemakerInventory";

export function WinesTab({ role }: { role: Role }) {
  const renderTableContent = () => {
    switch (role) {
      case Role.customer:
        return <CustomerOrderHistory />;
      case Role.shopOwner:
        return <ShopOwnerInventory />;
      default:
        return <WinemakerInventory />;
    }
  };
  return <div class="">{renderTableContent()}</div>;
}
