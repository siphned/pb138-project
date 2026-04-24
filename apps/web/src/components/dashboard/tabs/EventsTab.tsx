import { Role } from "@/types/roles";
import { CustomerEvents } from "./events/CustomerEvents";
import { ShopOwnerEvents } from "./events/ShopOwnerEvents";
import { WinemakerEvents } from "./events/WinemakerEvents";

export function EventsTab({ role }: { role: Role }) {
  const renderEventsContent = () => {
    switch (role) {
      case Role.CUSTOMER:
        return <CustomerEvents />;
      case Role.SHOP_OWNER:
        return <ShopOwnerEvents />;
      default:
        return <WinemakerEvents />;
    }
  };

  return <div className="">{renderEventsContent()}</div>;
}
